# AngularBaseApp
Using for implementing multiple apps within one solution.


# How To Build You App
All gulp command mut be invoked withing the root app's dir.


## Building for a dev environment
This will create the dist folder where all the sources will be placed using rules as for dev environment.
It means that the all js, css and html won't be compressed.
```
gulp --env dev
```
When the build process is done you can transfer the dist content into your dev environment.

## Building for a stage or prod environemtns
The command is almost the same:
```
gulp --env stage
```
and for a production
```
gulp --env prod
```
In this case you get all sources minified and ready to be moved to your evironment.