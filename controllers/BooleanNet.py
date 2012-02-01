# -*- coding: utf-8 -*-

def load():
	print "load"
	return None

def reset():
	print "reset"
	return None

def setState():
	print "set "+request.vars.id+" to "+request.vars.state
	return None

def iterate():
	print "iterate"
	return None

def status():
	print "status"
	return XML({'test':'demo'})
