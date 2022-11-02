const core = require('@actions/core');
const github = require('@actions/github');

try {
    // `who-to-greet` input defined in action metadata file
    const labelName = core.getInput('label-name');

    core.info('labelName required is: ' + labelName);

    const context = github.context.payload;

    console.log('eventName:' + github.context.eventName);

    console.log(JSON.stringify(github.context));
    
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}