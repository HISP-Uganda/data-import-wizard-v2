# Installation
At the moment, the data import wizard can be built from two repositories (core and utils). It also works along side a scheduler that processes data to import based on generated mappings.

1. [data-import-wizard-utils](https://github.com/HISP-Uganda/data-import-wizard-utils.git) - the utilities library that is also used by the data import wizard scheduler

1. [data-import-wizard-v2](https://github.com/HISP-Uganda/data-import-wizard-v2.git) - the core application
1. [data-import-wizard-scheduler](https://github.com/HISP-Uganda/data-import-wizard-v2.git) - the scheduler application.

## Recommended prerequisites.
1. Nodejs v18.16.0
1. Yarn


## Clone and build the utils repository
```bash
git clone https://github.com/HISP-Uganda/data-import-wizard-utils.git

cd data-import-wizard-utils

yarn install

yarn build

yarn link

# move 1 step out of the current directory
cd ..
```

## Clone and build the core repository
```bash
git clone https://github.com/HISP-Uganda/data-import-wizard-v2.git

cd data-import-wizard-v2

yarn install

yarn link "data-import-wizard-utils"

yarn build
```



Builds the app for production to the `build`folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
A deployable `.zip` file can be found in `build/bundle`!



## Installing the wizard in a DHIS2 instance

Navigate to the `App Management` core application in your DHIS 2 instance.

## Launching the data import wizard.

## Building and runing the scheduler


