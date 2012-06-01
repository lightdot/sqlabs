# -*- coding: utf-8 -*-
from gluon.storage import Storage
from gluon import *
import os

def file_path(*names):
    return os.path.join(os.path.dirname(os.path.dirname(current.request.folder)), *names)

def plugin_path(*names):
    return file_path('static', 'plugin_coffeescript', *names)

node_cmd = plugin_path('v0.4.7', 'bin', 'node')
coffee_path = plugin_path('v0.4.7', 'lib', 'node_modules', 'coffee-script', 'bin', 'coffee')
runtime_compiler = URL('static', 'plugin_coffeescript/coffee-script.js')


def _compile_coffee(url, compile):
    js_url = url.replace('.coffee', '.js')
    
    if not compile:
        return js_url

    names = url.split('/')
    names = names[1:]
    ofname = names[:-1] + [names[-1].replace('.coffee', '.js')]
    path = file_path(*names)
    ofpath = file_path(*ofname)

    if os.access(ofpath, os.F_OK):
        stat = os.stat(path)
        ofstat = os.stat(ofpath)
        if stat.st_mtime < ofstat.st_mtime:
         return js_url

    try:
        import coffeescript
    except ImportError:
        return url.replace('.coffee', '.js')
    
    src = open(path, 'r')
    dst = open(ofpath, 'w')
    try:
        dst.write(coffeescript.compile(src.read()))
    except Exception as e:
        print e

    return js_url

def append_coffeescript(url, runtime_compile=True):
    if current.request.is_local and runtime_compile:
        inline_code = ( 'js:inline', '''
          document.write('<script type="text/coffeescript" src="%(url)s"><\/script>');
        ''' % dict(url=url) )

        if runtime_compiler in current.response.files:
            corrent.response.files.remove(runtime_compiler)
        current.response.files.append(inline_code)
        current.response.files.append(runtime_compiler)
    else:
        url = _compile_coffee(url)

        if url:
            if not url in current.response.files:
                current.response.files.append(url)


def compile(compile=True, runtime_compile=None, *args):
    with_runtime_compiler = False
    if runtime_compile is None:
        runtime_compile = current.request.is_local

    for file in current.response.files:
        onetime_runtime_compile = False
        if file.endswith('.coffee'):
            if not runtime_compile:
                url = _compile_coffee(file, compile)
                if url:
                    current.response.files[current.response.files.index(file)] = url
                else:
                    ontime_runtime_compile = True

            if runtime_compile or onetime_runtime_compile:
                inline_code = ( 'js:inline', '''
                  document.write('<script type="text/coffeescript" src="%(url)s"><\/script>');
                ''' % dict(url=file) )
                current.response.files[current.response.files.index(file)] = inline_code
                with_runtime_compiler = True;

    if with_runtime_compiler:
        if runtime_compiler in current.response.files:
            corrent.response.files.remove(runtime_compiler)
        current.response.files.append(runtime_compiler)

