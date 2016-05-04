# AngularBaseApp
This structure helps to keep all your SPAs in one solution and  
build each application into a separate distro.  
Using that you can deploy your built apps into different  
places with less time.

# How To Build Your App
All gulp command must be invoked withing the root app's dir.

## Building dev environment
This command will create a folder where all the sources will be  
placed using rules as for dev environment.  
It means that all js, CSS, and HTML won't be compressed.
```
gulp --env dev
```
When the build process is done, you can transfer the distro  
content into your dev environment.

## Building either stage or prod environments
The command is almost the same:
```
gulp --env stage
```
and for a production
```
gulp --env prod
```
In this case, you get all sources minified and ready to be  
moved to your environment.