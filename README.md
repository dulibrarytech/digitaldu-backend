# Digital Collections Backend - digitaldu

## Background

The backend of the University of Denver's Digital Collections repository, https://specialcollections.du.edu.

## Contributing

Check out our [contributing guidelines](/CONTRIBUTING.md) for ways to offer feedback and contribute.

## Licenses

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

All other content is released under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/).

## Local Environment Setup

```
go into digitaldu-backend
npm install
if it doesn't work the first time delete the node_modules folder and npm install
have mysql 5.7
add .env file in root folder
add mysql schema and db "repo" and "repo_queue" to db, import .sql export
in git repo run "node repo.js"
http://localhost:8000/login
http://localhost:8000/dashboard/root-collections
```

## Maintainers

@freyesdulib

## Acknowledgments

@jrynhart

@kimpham54

@jackflaps
