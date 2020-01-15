# Auth
*Carmel repository that makes sure you will make authenticated requests, and keeps your users safe.*

### What's new?

1. ***Multiple route***
Used if you want different components for different roles, and you want to use the same path for those components. (its like HomeRoute without default component.)
example:
```
    <MultipleRoute path="/example" comps={{ "ex1": HiImAComp, "ex5w": CanYouBelieve }} />
```

2. ***Reset password***
In order to intergrate this feature, you need to:
     A. Add the route ```<Route path="/reset-password" component={ResetPassword} />``` to your App.js . This is the route that the user will see when he will click the link sent to his mail.
     B. Have email datasource in datasources.json, and to call it Email in model-config.
model-config- 
```
  "Email": {
    "dataSource": "email"
  },
```

You will find the Reset-password option in ***Login.jsx***. 

3. ***Under development***
* Logout
* Cookies
* registerOrLoginByUniqueField
If one of the above is not working, let us know.
**Before asking for help, make sure to have the lastest version of this repository!**