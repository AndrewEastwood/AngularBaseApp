# AngularBaseApp
This structure helps to keep all your SPAs in one solution and  
build each application into a separate distro.  
Using that you can deploy your built apps into different  
places with less time.

# How To Run Your App

There are two way to run your app locally. First is that your run 
the app from the SRC folder. That means that everything will be server  
as raw sources, uncompressed and fully opened for debugging.
```
node server.js --app %APP_NAME%
```
Another case is that you build your apps as it's normally performing  
in non local environments: dev, stage, prod, etc.
For that case you run the build command (see below) and then you run 
the following:
```
node server.js --app %APP_NAME% --port 2121 --dist
```
The server.js script accepts more commands:
--port defines which ports is going to be used for servinf your app
--host makes the server running using the specified host name
--dist the option with no value that indicates whether the app is being delivered from the distro or the raw sources

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


