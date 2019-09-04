# Digital Collections Backend - digitaldu

## Table of Contents

* [README](#readme)
* [Project Documentation](#project-documentation)
* [Releases](#releases)
* [Contact](#contact)

## README

### Background

The backend of the University of Denver's Digital Collections repository, https://specialcollections.du.edu.

### Contributing

Check out our [contributing guidelines](/CONTRIBUTING.md) for ways to offer feedback and contribute.

### Licenses

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

All other content is released under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/).

### Local Environment Setup

```
go into digitaldu-backend
npm install
if it doesn't work the first time delete the node_modules folder and npm install
have mysql 5.7
add .env file in root folder
add mysql schema and db "repo" and "repo_queue" to db, import .sql export
in git repo run "node repo.js"
http://localhost:8000/login
http://localhost:8000/dashboard/collections
```

### Maintainers

@freyesdulib

### Acknowledgments

@kimpham54, @jrynhart, @jackflaps, @josephlabrecque

## Project Documentation

* [v.1.0.0-beta pre release Repository Demo](https://youtu.be/1LGOQYEfz5I)
* [Documentation - Digital Repository Object Lifecycle Structure](https://docs.google.com/document/d/1lQcEt3_slGvSKYmw3hKKGtm9HiLsLEytdbC7oEI0xVo/edit?usp=sharing) - document that describes the different supported object types and their structure - Last Updated: 2019 July
* [Digital Collections BETA Architecture](https://drive.google.com/open?id=1J-06znPbHNQkKQ9gOB22Vtv7Rj8xDExX) - diagram that shows how our ecosystem, the repository frontend and backend is a component of this system - Last Updated: 2019 May
* [Digital Collections Use Cases](https://docs.google.com/spreadsheets/d/1EpKlDTfdVN2T460gfSVKJ5L_QNAFh70Nl9litHS7src/edit?usp=sharing) - use cases for the repository sofware and the ecosystem, frequently updated - Last Updated: August 2019
* [3 month release plan](https://docs.google.com/spreadsheets/d/1gAAGtfTig8HF6JJMafKCSzNeyyfqGQ8tKea8GrZqKts/edit?usp=sharing) - release plan from May to August 2019 - Last Updated: August 2019
* [Digital Collections Ecosystem Functional Requirements](https://docs.google.com/document/d/17aMJRY1mhag4lYREDVoLbjaJq0f3TmwapSGMsEOFkHg/edit?usp=sharing) - high level requirements for the ecosystem - Last Updated: September 2018
* [Digital Collections Personas](https://docs.google.com/document/d/10nZ6QcqcqOu4JY6fSlTAcem8Wvp1izpc5K3tXIAKijw/edit?usp=sharing) - personas for the ecosystem and repository software - Last Updated - December 2018
* [Digital Collections Content Interoperability Map](https://docs.google.com/spreadsheets/d/1C4NeajjkkLNidkGFQmCc5YPQvY_VTYXXvJUnvpQE5f8/edit?usp=sharing) - system inteoperability and where content resides - Last Upated: January 2019
* Survey for Requirements for Search in the DU Digital Collections Repository - anonymized responses available on request - Last Updated: April 2019
* Survey for Requirements for Streaming Media Player Requirements in the Digital Repository - anonymized responses available on request - Last Updated: May 2019
* Survey for Requirements for Digital Collections Repository Use Survey - anonymized responses available on request - Last Updated: January 2019
* [Presentation, Open Repositories - Building a connected digital collections ecosystem](https://docs.google.com/presentation/d/1UI1K6LbjuAYsbGPSMQaxaSXElUd-uud2g71Gv3TygaI/edit?usp=sharing) - Last Updated: August 2019

## Releases
* v1.0.0-beta [release]() [notes]()


## Contact

Ways to get in touch:

* Kim Pham (IT Librarian at University of Denver) - kim.pham60@du.edu
* Create an issue in this repository
