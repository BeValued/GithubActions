# GithubActions

Based on this guide

https://docs.github.com/en/actions/guides


This Action will check for the existence of a label on a pull request and set a "Failed" status on the pull request if it doesn't exist and a "Success" status if it does.

The most important files are 
action.yml
index.js

and the dist folder.


## action.yml

"action.yml" is the starting point for the action. This explains the actions inputs, outputs and what it needs to run.

https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action?learn=create_actions&learnProduct=actions#creating-an-action-metadata-file

## index.js

"index.js" is the actual functionality run by the action

https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action?learn=create_actions&learnProduct=actions#adding-actions-toolkit-packages

## dist folder

You have two options when publishing a package - you either commit it to github with the contents of the node_modules folder, or you compile it using vercel/ncc and point the action.yml at the output in the dist folder.

That is the approach I have taken 

So before committing your code, run the following in cmd / powershell in the GithubActions directory

```
ncc build index.js --license licenses.txt
```

https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action?learn=create_actions&learnProduct=actions#commit-tag-and-push-your-action-to-github