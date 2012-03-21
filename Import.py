def BooleanNet():
        if request.env.request_method == "GET":
                NetworkFolder = os.path.join(request.folder, "BooleanNetworks")
                if not os.path.exists(NetworkFolder):
                        os.mkdir(NetworkFolder)
                Models = []
                Scenarios = []
                for entry in os.listdir(NetworkFolder):
                        s = entry.split('.')
                        extension = s[len(s)-1].lower()
                        if extension == 'boolenet':
                                Models.append(entry)
                        elif extension == 'conf':
                                Scenarios.append(entry)
                return dict(Models=Models, Scenarios=Scenarios)

        if request.env.request_method == "POST":
                reset_current_session()
                model = deepcopy(session.bioGraph)
                del session.bioGraph

                repository = os.path.join(request.folder, "BooleanNetworks")

                if not request.vars.File in ['', None]:
                        uploaded_content = request.vars.File.file.read()
                        model.importBooleanNetwork( uploaded_content )  # upload file
                        open(repository+'/'+urllib.unquote(request.vars.file.filename), 'w').write(uploaded_content)
                elif not request.vars.Model in ['', None]:                              # choose a network on the server
                        model.importBooleanNetwork( open(repository+'/'+request.vars.Model).read() )
                        model.ModelName = request.vars.Model
                else:
                        return redirect( URL(r=request,c='Import',f='BooleanNet') )
                model.importBooleanNetworkScenarios(repository+'/'+request.vars.Scenarios)

                session.bioGraph = model

#               Layouter = request.vars.Layouter                                # a Layouter was chosen
#               if Layouter == "ask":
#                       return redirect( URL(r=request,c='Layout',f='choose') )
#               elif Layouter == "internal":
#                       return redirect( URL(r=request,c='Layout',f='internal') )
#               else:
                return redirect( URL(r=request,c='Layout',f='graphviz') )
