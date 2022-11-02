const core = require('@actions/core');
const github = require('@actions/github');

try {
    // `who-to-greet` input defined in action metadata file
    const labelName = core.getInput('label-name');

    core.info('labelName required is: ' + labelName);
    
    // Get the JSON webhook payload for the event that triggered the workflow

    let hasLabel = false;

    //if (github.context.payload.pull_request.labels.every(l=>l!==labelName)) {
    //    core.setFailed("This PR does not have the label: " + labelName);
    //}

    core.info('Current labels applied to this PR: ');

    github.context.payload.pull_request.labels.forEach(label => {
        core.info(label.name);

        if (label.name === labelName) {
            core.info('Labels match!');
            hasLabel = true;
        }
    });

    if (!hasLabel) {
        core.setFailed("This PR does not have the label: " + labelName);
    }

} catch (error) {
    core.setFailed(error.message);
}