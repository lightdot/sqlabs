#
# Copyright (c) 2012, Canonical Ltd
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, version 3 only.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
# GNU Lesser General Public License version 3 (see the file LICENSE).

"""The compiler for pybars."""


__all__ = [
    'Compiler',
    'strlist',
    ]

__metaclass__ = type

from functools import partial
import re

import pybars
from pymeta.grammar import OMeta
from pybars.frompymeta import moduleFromSource
from pymeta.builder import TreeBuilder, moduleFromGrammar

from gluon.html import XML

# preserve reference to the builtin compile.
_compile = compile

# Note that unless we presume handlebars is only generating valid html, we have
# to accept anything - so a broken template won't be all that visible - it will
# just render literally (because the anything rule matches it).

# this grammar generates a tokenised tree
handlebars_grammar = r"""

template ::= (<text> | <templatecommand>)*:body => ['template'] + body
text ::= (~(<start>) <anything>)+:text => ('literal', u''.join(text))
other ::= <anything>:char => ('literal', char)
templatecommand ::= <blockrule>
    | <comment>
    | <escapedexpression>
    | <expression>
    | <partial>
start ::= '{' '{'
finish ::= '}' '}'
comment ::= <start> '!' (~(<finish>) <anything>)* <finish> => ('comment', )
space ::= ' '|'\t'|'\r'|'\n'
arguments ::= (<space>+ (<kwliteral>|<literal>|<path>))*:arguments => arguments
expression_inner ::= <spaces> <path>:p <arguments>:arguments <spaces> <finish> => (p, arguments)
expression ::= <start> '{' <expression_inner>:e '}' => ('expand', ) + e
    | <start> '&' <expression_inner>:e => ('expand', ) + e
escapedexpression ::= <start> <expression_inner>:e => ('escapedexpand', ) + e
block_inner ::= <spaces> <symbol>:s <arguments>:args <spaces> <finish>
    => (u''.join(s), args)
partial ::= <start> '>' <block_inner>:i => ('partial',) + i
path ::= ~('/') <pathseg>+:segments => ('path', segments)
kwliteral ::= <symbol>:s '=' (<literal>|<path>):v => ('kwparam', s, v)
literal ::= (<string>|<integer>|<boolean>):thing => ('literalparam', thing)
string ::= '"' <notquote>*:ls '"' => u'"' + u''.join(ls) + u'"'
integer ::= <digit>+:ds => int(''.join(ds))
boolean ::= <false>|<true>
false ::= 'f' 'a' 'l' 's' 'e' => False
true ::= 't' 'r' 'u' 'e' => True
notquote ::= <escapedquote> | (~('"') <anything>)
escapedquote ::= '\\' '"' => '\\"'
symbol ::= '['? (<letterOrDigit>|'-'|'@')+:symbol ']'? => u''.join(symbol)
pathseg ::= <symbol>
    | '/' => u''
    | ('.' '.' '/') => u'__parent'
    | '.' => u''
pathfinish :expected ::= <start> '/' <path>:found ?(found == expected) <finish>
symbolfinish :expected ::= <start> '/' <symbol>:found ?(found == expected) <finish>
blockrule ::= <start> '#' <block_inner>:i
      <template>:t <alttemplate>:alt_t <symbolfinish i[0]> => ('block',) + i + (t, alt_t)
    | <start> '^' <block_inner>:i
      <template>:t <symbolfinish i[0]> => ('invertedblock',) + i + (t,)
alttemplate ::= (<start>'^'<finish> <template>)?:alt_t => alt_t or []
"""

# this grammar compiles the template to python
compile_grammar = """
compile ::= <prolog> <rule>* => builder.finish()
prolog ::= "template" => builder.start()
rule ::= <literal>
    | <expand>
    | <escapedexpand>
    | <comment>
    | <block>
    | <invertedblock>
    | <partial>
block ::= [ "block" <anything>:symbol [<arg>*:arguments] [<compile>:t] [<compile>?:alt_t] ] => builder.add_block(symbol, arguments, t, alt_t)
comment ::= [ "comment" ]
literal ::= [ "literal" :value ] => builder.add_literal(value)
expand ::= [ "expand" <path>:value [<arg>*:arguments]] => builder.add_expand(value, arguments)
escapedexpand ::= [ "escapedexpand" <path>:value [<arg>*:arguments]] => builder.add_escaped_expand(value, arguments)
invertedblock ::= [ "invertedblock" <anything>:symbol [<arg>*:arguments] [<compile>:t] ] => builder.add_invertedblock(symbol, arguments, t)
partial ::= ["partial" <anything>:symbol [<arg>*:arguments]] => builder.add_partial(symbol, arguments)
path ::= [ "path" [<pathseg>:segment]] => ("simple", segment)
 | [ "path" [<pathseg>+:segments] ] => ("complex", u'resolve(context, "'  + u'","'.join(segments) + u'")' )
simplearg ::= [ "path" [<pathseg>+:segments] ] => u'resolve(context, "'  + u'","'.join(segments) + u'")'
    | [ "literalparam" <anything>:value ] => unicode(value)
arg ::= [ "kwparam" <anything>:symbol <simplearg>:a ] => unicode(symbol) + '=' + a
    | <simplearg>
pathseg ::= "/" => ''
    | "." => ''
    | "" => ''
    | "this" => ''
pathseg ::= <anything>:symbol => u''.join(symbol)
"""

class strlist(list):
    """A quasi-list to let the template code avoid special casing."""
    
    def __init__(self, response=None):
        self.response = response
        
    def __unicode__(self):
        return u''.join(self)
    
    def append(self, value):
        if self.response:
            self.response.write(XML(value))
        else:
            list.append(self, value)
    def grow(self, thing):
        """Make the list longer, appending for unicode, extending otherwise."""
        if type(thing) == unicode:
            list.append(self, thing)
        elif type(thing) == str:
            # Ugh. Kill this in 3.
            list.append(self, unicode(thing))
        else: 
            # Recursively expand to a flat list; may deserve a C accelerator at
            # some point.
            for element in thing:
                self.grow(element)


_map = {
    '&':'&amp;',
    '"':'&quot;',
    '\'':'&#x27;',
    '`':'&#x60;',
    '<':'&lt;',
    '>':'&gt;',
    }
def substitute(match, _map=_map):
    return _map[match.group(0)]


_escape_re = re.compile(r"&|\"|'|`|<|>")
def escape(something, _escape_re=_escape_re, substitute=substitute):
    return _escape_re.sub(substitute, something)


sentinel = object()

class Scope:

    def __init__(self, context, parent):
        self.context = context
        self.parent = parent

    def get(self, name, default=None):
        if name == '__parent':
            return self.parent
        if name == 'this':
            return self.context
        result = self.context.get(name, self)
        if result is not self:
            return result
        return default
    __getitem__ = get

    def __unicode__(self):
        return unicode(self.context)


def resolve(context, *segments):
    for segment in segments:
        if context is None:
            return None
        if segment in (None, ""):
            continue
        if type(context) in (list, tuple):
            offset = int(segment)
            context = context[offset]
        else:
            context = context.get(segment)
    return context


def _each(this, options, context):
    result = strlist()
    for local_context in context:
        scope = Scope(local_context, this)
        result.grow(options['fn'](scope))
    return result


def _if(this, options, context):
    if callable(context):
        context = context(this)
    if context:
        return options['fn'](this)


def _log(this, context):
    pybars.log(context)


def _unless(this, options, context):
    if not context:
        return options['fn'](this)


def _blockHelperMissing(this, options, context):
    # print this, context
    if callable(context):
        context = context(this)
    if context != u"" and not context:
        return options['inverse'](this)
    if type(context) in (list, strlist, tuple):
        return _each(this, options, context)
    if context is True:
        callwith = this
    else:
        callwith = context
    return options['fn'](callwith)


def _with(this, options, context):
    return options['fn'](context)

# scope for the compiled code to reuse globals
_pybars_ = {
    'helpers': {
        'blockHelperMissing': _blockHelperMissing,
        'each': _each,
        'if': _if,
        'log': _log,
        'unless': _unless,
        'with': _with,
    }
}

class CodeBuilder:
    """Builds code for a template."""

    def __init__(self, response):
        self.stack = []
        self.response = response

    def start(self):
        self.stack.append((strlist(), {}))
        self._result, self._locals = self.stack[-1]
        # Context may be a user hash or a Scope (which injects '__parent' to
        # implement .. lookups). The JS implementation uses a vector of scopes
        # and then interprets a linear walk-up, which is why there is a
        # disabled test showing arbitrary complex path manipulation: the scope
        # approach used here will probably DTRT but may be slower: reevaluate
        # when profiling.
        self._result.grow(u"def render(context, helpers=None, partials=None):\n")
        self._result.grow(u"    result = strlist(response)\n")
        self._result.grow(u"    if helpers is None: helpers = {}\n")
        self._result.grow(u"    helpers.update(pybars['helpers'])\n")
        self._result.grow(u"    if partials is None: partials = {}\n")
        # Expose used functions and helpers to the template.
        self._locals['strlist'] = strlist
        self._locals['escape'] = escape
        self._locals['Scope'] = Scope
        self._locals['partial'] = partial
        self._locals['pybars'] = _pybars_
        self._locals['resolve'] = resolve
        self._locals['response'] = self.response

    def finish(self):
        self._result.grow(u"    return result\n")
        lines, ns = self.stack.pop(-1)
        source = unicode(lines)
        self._result = self.stack and self.stack[-1][0]
        self._locals = self.stack and self.stack[-1][1]
        fn = moduleFromSource(source, 'render', globalsDict=ns, registerModule=True)
        # print source
        return fn

    def allocate_value(self, value):
        name = 'constant_%d' % len(self._locals)
        self._locals[name] = value
        return name

    def _wrap_nested(self, name):
        return u"partial(%s, helpers=helpers, partials=partials)" % name

    def add_block(self, symbol, arguments, nested, alt_nested):
        name = self.allocate_value(nested)
        if alt_nested:
            alt_name = self.allocate_value(alt_nested)
        call = self.arguments_to_call(arguments)
        self._result.grow([
            u"    options = {'fn': %s}\n" % self._wrap_nested(name),
            u"    options['helpers'] = helpers\n"
            u"    options['partials'] = partials\n"
            ])
        if alt_nested:
            self._result.grow([
                u"    options['inverse'] = ",
                self._wrap_nested(alt_name),
                u"\n"
                ])
        else:
            self._result.grow([
                u"    options['inverse'] = lambda this: None\n"
                ])
        self._result.grow([
            u"    value = helper = helpers.get('%s')\n" % symbol,
            u"    if value is None:\n"
            u"        value = context.get('%s')\n" % symbol,
            u"    if helper and callable(helper):\n"
            u"        this = Scope(context, context)\n"
            u"        value = value(this, options, %s\n" % call,
            u"    else:\n"
            u"        helper = helpers['blockHelperMissing']\n"
            u"        value = helper(context, options, value)\n"
            u"    if value is None: value = ''\n"
            u"    result.grow(value)\n"
            ])

    def add_literal(self, value):
        name = self.allocate_value(value)
        self._result.grow(u"    result.append(%s)\n" % name)

    def _lookup_arg(self, arg):
        if not arg:
            return u"context"
        return arg

    def arguments_to_call(self, arguments):
        params = map(self._lookup_arg, arguments)
        return u", ".join(params) + ")"

    def find_lookup(self, path, path_type, call):
        if path and path_type == "simple": # simple names can reference helpers.
            # TODO: compile this whole expression in the grammar; for now,
            # fugly but only a compile time overhead.
            # XXX: just rm.
            realname = path.replace('.get("', '').replace('")', '')
            self._result.grow([
                u"    value = helpers.get('%s')\n" % realname,
                u"    if value is None:\n"
                u"        value = resolve(context, '%s')\n" % path,
                ])
        elif path_type == "simple":
            realname = None
            self._result.grow([
                u"    value = resolve(context, '%s')\n" % path,
                ])
        else:
            realname = None
            self._result.grow(u"    value = %s\n" % path)
        self._result.grow([
            u"    if callable(value):\n"
            u"        this = Scope(context, context)\n"
            u"        value = value(this, %s\n" % call,
            ])
        if realname:
            self._result.grow(
                u"    elif value is None:\n"
                u"        this = Scope(context, context)\n"
                u"        value = helpers.get('helperMissing')(this, '%s', %s\n"
                    % (realname, call)
                )
        self._result.grow(u"    if value is None: value = ''\n")

    def add_escaped_expand(self, (path_type, path), arguments):
        call = self.arguments_to_call(arguments)
        self.find_lookup(path, path_type, call)
        self._result.grow([
            u"    if type(value) is not strlist:\n"
            u"        value = escape(unicode(value))\n"
            u"    result.grow(value)\n"
            ])

    def add_expand(self, (path_type, path), arguments):
        call = self.arguments_to_call(arguments)
        self.find_lookup(path, path_type, call)
        self._result.grow([
            u"    if type(value) is not strlist:\n"
            u"        value = unicode(value)\n"
            u"    result.grow(value)\n"
            ])

    def _debug(self):
        self._result.grow(u"    import pdb;pdb.set_trace()\n")

    def add_invertedblock(self, symbol, arguments, nested):
        # This may need to be a blockHelperMissing clal as well.
        name = self.allocate_value(nested)
        self._result.grow([
            u"    value = context.get('%s')\n" % symbol,
            u"    if not value:\n"
            u"    "])
        self._invoke_template(name, "context")

    def _invoke_template(self, fn_name, this_name):
        self._result.grow([
            u"    result.grow(",
            fn_name,
            u"(",
            this_name,
            u", helpers=helpers, partials=partials))\n"
            ])

    def add_partial(self, symbol, arguments):
        if arguments:
            assert len(arguments) == 1, arguments
            arg = arguments[0]
        else:
            arg = ""
        self._result.grow([
            u"    inner = partials['%s']\n" % symbol,
            u"    scope = Scope(%s, context)\n" % self._lookup_arg(arg)])
        self._invoke_template("inner", "scope")


# TODO: move to a better home
global_helpers = {}

class Compiler:
    """A handlebars template compiler.
    
    The compiler is not threadsafe: you need one per thread because of the
    state in CodeBuilder.
    """


    def __init__(self, response):
        self._helpers = {}
        self._handlebars = Compiler._get_handlebars_template()
        self._compiler = Compiler._get_compiler(response)

    @staticmethod
    def _get_handlebars_template():
        # self._handlebars = OMeta.makeGrammar(handlebars_grammar, {}, 'handlebars')

        name = "handlebars"
        globals = {}
        # g = OMeta.metagrammarClass(handlebars_grammar)
        # tree = g.parseGrammar(name, TreeBuilder)
        tree = ['Grammar', 'handlebars', [['Rule', 'template', ['And', [['And', []], ['Or', [['And', [['Bind', 'body', ['Many', ['Or', [['And', [['Apply', 'text', 'template', ()]]], ['And', [['Apply', 'templatecommand', 'template', ()]]]]]]], ['Python', "['template'] + body"]]]]]]]], ['Rule', 'text', ['And', [['And', []], ['Or', [['And', [['Bind', 'text', ['Many1', ['Or', [['And', [['Not', ['Or', [['And', [['Apply', 'start', 'text', ()]]]]]], ['Apply', 'anything', 'text', ()]]]]]]], ['Python', "('literal', u''.join(text))"]]]]]]]], ['Rule', 'other', ['And', [['And', []], ['Or', [['And', [['Bind', 'char', ['Apply', 'anything', 'other', ()]], ['Python', "('literal', char)"]]]]]]]], ['Rule', 'templatecommand', ['And', [['And', []], ['Or', [['And', [['Apply', 'blockrule', 'templatecommand', ()]]], ['And', [['Apply', 'comment', 'templatecommand', ()]]], ['And', [['Apply', 'escapedexpression', 'templatecommand', ()]]], ['And', [['Apply', 'expression', 'templatecommand', ()]]], ['And', [['Apply', 'partial', 'templatecommand', ()]]]]]]]], ['Rule', 'start', ['And', [['And', []], ['Or', [['And', [['Exactly', '{'], ['Exactly', '{']]]]]]]], ['Rule', 'finish', ['And', [['And', []], ['Or', [['And', [['Exactly', '}'], ['Exactly', '}']]]]]]]], ['Rule', 'comment', ['And', [['And', []], ['Or', [['And', [['Apply', 'start', 'comment', ()], ['Exactly', '!'], ['Many', ['Or', [['And', [['Not', ['Or', [['And', [['Apply', 'finish', 'comment', ()]]]]]], ['Apply', 'anything', 'comment', ()]]]]]], ['Apply', 'finish', 'comment', ()], ['Python', "('comment', )"]]]]]]]], ['Rule', 'space', ['And', [['And', []], ['Or', [['And', [['Exactly', ' ']]], ['And', [['Exactly', '\t']]], ['And', [['Exactly', '\r']]], ['And', [['Exactly', '\n']]]]]]]], ['Rule', 'arguments', ['And', [['And', []], ['Or', [['And', [['Bind', 'arguments', ['Many', ['Or', [['And', [['Many1', ['Apply', 'space', 'arguments', ()]], ['Or', [['And', [['Apply', 'kwliteral', 'arguments', ()]]], ['And', [['Apply', 'literal', 'arguments', ()]]], ['And', [['Apply', 'path', 'arguments', ()]]]]]]]]]]], ['Python', 'arguments']]]]]]]], ['Rule', 'expression_inner', ['And', [['And', []], ['Or', [['And', [['Apply', 'spaces', 'expression_inner', ()], ['Bind', 'p', ['Apply', 'path', 'expression_inner', ()]], ['Bind', 'arguments', ['Apply', 'arguments', 'expression_inner', ()]], ['Apply', 'spaces', 'expression_inner', ()], ['Apply', 'finish', 'expression_inner', ()], ['Python', '(p, arguments)']]]]]]]], ['Rule', 'expression', ['And', [['And', []], ['Or', [['And', [['Apply', 'start', 'expression', ()], ['Exactly', '{'], ['Bind', 'e', ['Apply', 'expression_inner', 'expression', ()]], ['Exactly', '}'], ['Python', "('expand', ) + e"]]], ['And', [['Apply', 'start', 'expression', ()], ['Exactly', '&'], ['Bind', 'e', ['Apply', 'expression_inner', 'expression', ()]], ['Python', "('expand', ) + e"]]]]]]]], ['Rule', 'escapedexpression', ['And', [['And', []], ['Or', [['And', [['Apply', 'start', 'escapedexpression', ()], ['Bind', 'e', ['Apply', 'expression_inner', 'escapedexpression', ()]], ['Python', "('escapedexpand', ) + e"]]]]]]]], ['Rule', 'block_inner', ['And', [['And', []], ['Or', [['And', [['Apply', 'spaces', 'block_inner', ()], ['Bind', 's', ['Apply', 'symbol', 'block_inner', ()]], ['Bind', 'args', ['Apply', 'arguments', 'block_inner', ()]], ['Apply', 'spaces', 'block_inner', ()], ['Apply', 'finish', 'block_inner', ()], ['Python', "(u''.join(s), args)"]]]]]]]], ['Rule', 'partial', ['And', [['And', []], ['Or', [['And', [['Apply', 'start', 'partial', ()], ['Exactly', '>'], ['Bind', 'i', ['Apply', 'block_inner', 'partial', ()]], ['Python', "('partial',) + i"]]]]]]]], ['Rule', 'path', ['And', [['And', []], ['Or', [['And', [['Not', ['Or', [['And', [['Exactly', '/']]]]]], ['Bind', 'segments', ['Many1', ['Apply', 'pathseg', 'path', ()]]], ['Python', "('path', segments)"]]]]]]]], ['Rule', 'kwliteral', ['And', [['And', []], ['Or', [['And', [['Bind', 's', ['Apply', 'symbol', 'kwliteral', ()]], ['Exactly', '='], ['Bind', 'v', ['Or', [['And', [['Apply', 'literal', 'kwliteral', ()]]], ['And', [['Apply', 'path', 'kwliteral', ()]]]]]], ['Python', "('kwparam', s, v)"]]]]]]]], ['Rule', 'literal', ['And', [['And', []], ['Or', [['And', [['Bind', 'thing', ['Or', [['And', [['Apply', 'string', 'literal', ()]]], ['And', [['Apply', 'integer', 'literal', ()]]], ['And', [['Apply', 'boolean', 'literal', ()]]]]]], ['Python', "('literalparam', thing)"]]]]]]]], ['Rule', 'string', ['And', [['And', []], ['Or', [['And', [['Exactly', '"'], ['Bind', 'ls', ['Many', ['Apply', 'notquote', 'string', ()]]], ['Exactly', '"'], ['Python', 'u\'"\' + u\'\'.join(ls) + u\'"\'']]]]]]]], ['Rule', 'integer', ['And', [['And', []], ['Or', [['And', [['Bind', 'ds', ['Many1', ['Apply', 'digit', 'integer', ()]]], ['Python', "int(''.join(ds))"]]]]]]]], ['Rule', 'boolean', ['And', [['And', []], ['Or', [['And', [['Apply', 'false', 'boolean', ()]]], ['And', [['Apply', 'true', 'boolean', ()]]]]]]]], ['Rule', 'false', ['And', [['And', []], ['Or', [['And', [['Exactly', 'f'], ['Exactly', 'a'], ['Exactly', 'l'], ['Exactly', 's'], ['Exactly', 'e'], ['Python', 'False']]]]]]]], ['Rule', 'true', ['And', [['And', []], ['Or', [['And', [['Exactly', 't'], ['Exactly', 'r'], ['Exactly', 'u'], ['Exactly', 'e'], ['Python', 'True']]]]]]]], ['Rule', 'notquote', ['And', [['And', []], ['Or', [['And', [['Apply', 'escapedquote', 'notquote', ()]]], ['And', [['Or', [['And', [['Not', ['Or', [['And', [['Exactly', '"']]]]]], ['Apply', 'anything', 'notquote', ()]]]]]]]]]]]], ['Rule', 'escapedquote', ['And', [['And', []], ['Or', [['And', [['Exactly', '\\'], ['Exactly', '"'], ['Python', '\'\\\\"\'']]]]]]]], ['Rule', 'symbol', ['And', [['And', []], ['Or', [['And', [['Optional', ['Exactly', '[']], ['Bind', 'symbol', ['Many1', ['Or', [['And', [['Apply', 'letterOrDigit', 'symbol', ()]]], ['And', [['Exactly', '-']]], ['And', [['Exactly', '@']]]]]]], ['Optional', ['Exactly', ']']], ['Python', "u''.join(symbol)"]]]]]]]], ['Rule', 'pathseg', ['And', [['And', []], ['Or', [['And', [['Apply', 'symbol', 'pathseg', ()]]], ['And', [['Exactly', '/'], ['Python', "u''"]]], ['And', [['Or', [['And', [['Exactly', '.'], ['Exactly', '.'], ['Exactly', '/']]]]], ['Python', "u'__parent'"]]], ['And', [['Exactly', '.'], ['Python', "u''"]]]]]]]], ['Rule', 'pathfinish', ['And', [['And', [['Bind', 'expected', ['Apply', 'anything', 'pathfinish', ()]]]], ['Or', [['And', [['Apply', 'start', 'pathfinish', ()], ['Exactly', '/'], ['Bind', 'found', ['Apply', 'path', 'pathfinish', ()]], ['Predicate', ['Python', 'found == expected']], ['Apply', 'finish', 'pathfinish', ()]]]]]]]], ['Rule', 'symbolfinish', ['And', [['And', [['Bind', 'expected', ['Apply', 'anything', 'symbolfinish', ()]]]], ['Or', [['And', [['Apply', 'start', 'symbolfinish', ()], ['Exactly', '/'], ['Bind', 'found', ['Apply', 'symbol', 'symbolfinish', ()]], ['Predicate', ['Python', 'found == expected']], ['Apply', 'finish', 'symbolfinish', ()]]]]]]]], ['Rule', 'blockrule', ['And', [['And', []], ['Or', [['And', [['Apply', 'start', 'blockrule', ()], ['Exactly', '#'], ['Bind', 'i', ['Apply', 'block_inner', 'blockrule', ()]], ['Bind', 't', ['Apply', 'template', 'blockrule', ()]], ['Bind', 'alt_t', ['Apply', 'alttemplate', 'blockrule', ()]], ['Apply', 'symbolfinish', 'blockrule', (['Python', 'i[0]'],)], ['Python', "('block',) + i + (t, alt_t)"]]], ['And', [['Apply', 'start', 'blockrule', ()], ['Exactly', '^'], ['Bind', 'i', ['Apply', 'block_inner', 'blockrule', ()]], ['Bind', 't', ['Apply', 'template', 'blockrule', ()]], ['Apply', 'symbolfinish', 'blockrule', (['Python', 'i[0]'],)], ['Python', "('invertedblock',) + i + (t,)"]]]]]]]], ['Rule', 'alttemplate', ['And', [['And', []], ['Or', [['And', [['Bind', 'alt_t', ['Optional', ['Or', [['And', [['Apply', 'start', 'alttemplate', ()], ['Exactly', '^'], ['Apply', 'finish', 'alttemplate', ()], ['Apply', 'template', 'alttemplate', ()]]]]]]], ['Python', 'alt_t or []']]]]]]]]]]

        return moduleFromGrammar(tree, name, OMeta, globals)

    @staticmethod
    def _get_compiler(response):
        # self._compiler = OMeta.makeGrammar(compile_grammar, {'builder':self._builder})
        _builder = CodeBuilder(response)

        name = "Grammar"
        globals = {'builder':_builder}
        # g = OMeta.metagrammarClass(compile_grammar)
        # tree = g.parseGrammar(name, TreeBuilder)
        tree = ['Grammar', 'Grammar', [['Rule', 'compile', ['And', [['And', []], ['Or', [['And', [['Apply', 'prolog', 'compile', ()], ['Many', ['Apply', 'rule', 'compile', ()]], ['Python', 'builder.finish()']]]]]]]], ['Rule', 'prolog', ['And', [['And', []], ['Or', [['And', [['Exactly', 'template'], ['Python', 'builder.start()']]]]]]]], ['Rule', 'rule', ['And', [['And', []], ['Or', [['And', [['Apply', 'literal', 'rule', ()]]], ['And', [['Apply', 'expand', 'rule', ()]]], ['And', [['Apply', 'escapedexpand', 'rule', ()]]], ['And', [['Apply', 'comment', 'rule', ()]]], ['And', [['Apply', 'block', 'rule', ()]]], ['And', [['Apply', 'invertedblock', 'rule', ()]]], ['And', [['Apply', 'partial', 'rule', ()]]]]]]]], ['Rule', 'block', ['And', [['And', []], ['Or', [['And', [['List', ['Or', [['And', [['Exactly', 'block'], ['Bind', 'symbol', ['Apply', 'anything', 'block', ()]], ['List', ['Or', [['And', [['Bind', 'arguments', ['Many', ['Apply', 'arg', 'block', ()]]]]]]]], ['List', ['Or', [['And', [['Bind', 't', ['Apply', 'compile', 'block', ()]]]]]]], ['List', ['Or', [['And', [['Bind', 'alt_t', ['Optional', ['Apply', 'compile', 'block', ()]]]]]]]]]]]]], ['Python', 'builder.add_block(symbol, arguments, t, alt_t)']]]]]]]], ['Rule', 'comment', ['And', [['And', []], ['Or', [['And', [['List', ['Or', [['And', [['Exactly', 'comment']]]]]]]]]]]]], ['Rule', 'literal', ['And', [['And', []], ['Or', [['And', [['List', ['Or', [['And', [['Exactly', 'literal'], ['Bind', 'value', ['Apply', 'anything', 'literal', ()]]]]]]], ['Python', 'builder.add_literal(value)']]]]]]]], ['Rule', 'expand', ['And', [['And', []], ['Or', [['And', [['List', ['Or', [['And', [['Exactly', 'expand'], ['Bind', 'value', ['Apply', 'path', 'expand', ()]], ['List', ['Or', [['And', [['Bind', 'arguments', ['Many', ['Apply', 'arg', 'expand', ()]]]]]]]]]]]]], ['Python', 'builder.add_expand(value, arguments)']]]]]]]], ['Rule', 'escapedexpand', ['And', [['And', []], ['Or', [['And', [['List', ['Or', [['And', [['Exactly', 'escapedexpand'], ['Bind', 'value', ['Apply', 'path', 'escapedexpand', ()]], ['List', ['Or', [['And', [['Bind', 'arguments', ['Many', ['Apply', 'arg', 'escapedexpand', ()]]]]]]]]]]]]], ['Python', 'builder.add_escaped_expand(value, arguments)']]]]]]]], ['Rule', 'invertedblock', ['And', [['And', []], ['Or', [['And', [['List', ['Or', [['And', [['Exactly', 'invertedblock'], ['Bind', 'symbol', ['Apply', 'anything', 'invertedblock', ()]], ['List', ['Or', [['And', [['Bind', 'arguments', ['Many', ['Apply', 'arg', 'invertedblock', ()]]]]]]]], ['List', ['Or', [['And', [['Bind', 't', ['Apply', 'compile', 'invertedblock', ()]]]]]]]]]]]], ['Python', 'builder.add_invertedblock(symbol, arguments, t)']]]]]]]], ['Rule', 'partial', ['And', [['And', []], ['Or', [['And', [['List', ['Or', [['And', [['Exactly', 'partial'], ['Bind', 'symbol', ['Apply', 'anything', 'partial', ()]], ['List', ['Or', [['And', [['Bind', 'arguments', ['Many', ['Apply', 'arg', 'partial', ()]]]]]]]]]]]]], ['Python', 'builder.add_partial(symbol, arguments)']]]]]]]], ['Rule', 'path', ['And', [['And', []], ['Or', [['And', [['List', ['Or', [['And', [['Exactly', 'path'], ['List', ['Or', [['And', [['Bind', 'segment', ['Apply', 'pathseg', 'path', ()]]]]]]]]]]]], ['Python', '("simple", segment)']]], ['And', [['List', ['Or', [['And', [['Exactly', 'path'], ['List', ['Or', [['And', [['Bind', 'segments', ['Many1', ['Apply', 'pathseg', 'path', ()]]]]]]]]]]]]], ['Python', '("complex", u\'resolve(context, "\'  + u\'","\'.join(segments) + u\'")\' )']]]]]]]], ['Rule', 'simplearg', ['And', [['And', []], ['Or', [['And', [['List', ['Or', [['And', [['Exactly', 'path'], ['List', ['Or', [['And', [['Bind', 'segments', ['Many1', ['Apply', 'pathseg', 'simplearg', ()]]]]]]]]]]]]], ['Python', 'u\'resolve(context, "\'  + u\'","\'.join(segments) + u\'")\'']]], ['And', [['List', ['Or', [['And', [['Exactly', 'literalparam'], ['Bind', 'value', ['Apply', 'anything', 'simplearg', ()]]]]]]], ['Python', 'unicode(value)']]]]]]]], ['Rule', 'arg', ['And', [['And', []], ['Or', [['And', [['List', ['Or', [['And', [['Exactly', 'kwparam'], ['Bind', 'symbol', ['Apply', 'anything', 'arg', ()]], ['Bind', 'a', ['Apply', 'simplearg', 'arg', ()]]]]]]], ['Python', "unicode(symbol) + '=' + a"]]], ['And', [['Apply', 'simplearg', 'arg', ()]]]]]]]], ['Rule', 'pathseg', ['Or', [['And', [['And', []], ['Or', [['And', [['Exactly', '/'], ['Python', "''"]]], ['And', [['Exactly', '.'], ['Python', "''"]]], ['And', [['Exactly', ''], ['Python', "''"]]], ['And', [['Exactly', 'this'], ['Python', "''"]]]]]]], ['And', [['And', []], ['Or', [['And', [['Bind', 'symbol', ['Apply', 'anything', 'pathseg', ()]], ['Python', "u''.join(symbol)"]]]]]]]]]]]]
        return moduleFromGrammar(tree, name, OMeta, globals)

    def compile(self, source):
        """Compile source to a ready to run template.
        
        :param source: The template to compile - should be a unicode string.
        :return: A template ready to run.
        """
        assert isinstance(source, unicode)
        tree = self._handlebars(source).apply('template')[0]
        # print source
        # print '-->'
        # print "T", tree
        code = self._compiler(tree).apply('compile')[0]
        return code

    def register_helper(self, helper_name, helper_callback):
        """Register a block helper.

        :param helper_name: The name of the helper.
        :param helper_callback: A callback to call when the helper is used.
            This should accept two parameters - items (the context sub-value
            specified by the block rule in the template) and options (which has
            template logic in it such as the render callback to render the
            block content for a single item).
        :return: None
        """
        global_helpers[helper_name] = helper_callback

#orig = Compiler._handlebars.rule_blockrule
#def thunk(*args, **kwargs):
#    import pdb;pdb.set_trace()
#    return orig(*args, **kwargs)
#Compiler._handlebars.rule_blockrule = thunk
