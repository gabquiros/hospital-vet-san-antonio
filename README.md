# Base-Jezkyllized

Based on [*generator-jekyllized*](https://github.com/sondr3/generator-jekyllized).

"Jekyllized is a very opinionated Yeoman generator for very quickly and effortlessly allowing you to build Jekyll based sites with Gulp. Get started using Yo to scaffold your site and start developing. Your assets are automatically updated when developing and injected into your browser with BrowserSync and are also optimized when you're ready to publish."

*Note: Please use Stylekyll if your project will focused on creating a Styleguide.

## Dependencies

In order to work with the template, you will need the following tools:
- [*Ruby*](https://www.ruby-lang.org/en/).
- [*Nodejs*](http://nodejs.org/).
- [*Xcode command line tools *](https://developer.apple.com/xcode/).

## Instructions:

* Download and install [*Xcode command line tools *](https://developer.apple.com/xcode/).

* Download and install [*RVM*](https://rvm.io/rvm/install) (Ruby version Manager is optional)

    Run the following command to install rvm it:

        $ \curl -sSL https://get.rvm.io | bash

* Then update Ruby to the 2.2.3 or higer version (Recommended version: ruby 2.2.3p173)

        $ rvm install 2.2.3

* Choose ^2.2.3 as the default Ruby for RVM

        $ rvm --default use 2.2.3

* Download and install [*Node.JS*](http://nodejs.org/) **v0.12.2**.

* With this done, you have to install the following Gem:
    
        gem install bundler

* Then you can run the following command to install ruby dependencies:
    
        $ bundle install

* Then you need to install the node dependencies, so run:

        $ npm install -g gulp && npm install -g bower && npm install

* After installing all ruby and nodes dependencies, you should update the front-end dependencies, so run:

        $ bower install
        
    ...and you're almost done. 

* Since we are using a specific version of Gulp, make sure you run Gulp as:
	
	npm start 
        
        or 
        
        node_modules/.bin/gulp

    
### How to run it

To see your project running please run (For Development):

    $ npm start  
    
    or  
    
    gulp

To deploy your project please run (For RE Builds):

    $ gulp build --prod

Thanks
