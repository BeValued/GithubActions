const core = require('@actions/core');
const github = require('@actions/github');

try {
    // `who-to-greet` input defined in action metadata file
    const labelName = core.getInput('label-name');

    core.info('labelName required is: ' + labelName);

    // Get the JSON webhook payload for the event that triggered the workflow

    if (github.context.payload.pull_request.labels.every(l => l.name !== labelName)) {
        core.setFailed("This PR does not have the label: " + labelName);
    } else {
        console.log('Auto Merge is:' + github.context.payload.pull_request.auto_merge);
        github.context.payload.pull_request.auto_merge = true;
    }
} catch (error) {
    core.setFailed(error.message);
}