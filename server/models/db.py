# -*- coding: utf-8 -*-

# http://www.web2py.com/book/default/chapter/06

db = DAL('sqlite://biographer.sqlite')

db.define_table('BioModels',	Field('BIOMD','string'),	Field('Title','string') )
db.define_table('Reactome',	Field('ST_ID','string'),	Field('Title','string') )

