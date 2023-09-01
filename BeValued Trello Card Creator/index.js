const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');

const trelloApiKey = core.getInput('trello-api-key', { required: true })
const trelloAuthToken = core.getInput('trello-auth-token', { required: true })
const trelloListId = core.getInput('trello-list-id', { required: true })

const githubToken = core.getInput('github-token', { required: true })
const owner = core.getInput('owner', { required: true })
const repo = core.getInput('repo', { required: true })

const labelName = core.getInput('label-name');

const octokit = github.getOctokit(githubToken)

// Check labels

// If label matches input
// Check PR has "Trello" label
// if yes - exit
// if not, create trello card in list, save link to comments on PR

async function run() {

    try {

        core.info('labelName required is: ' + labelName);

        const pr = github.context.payload.pull_request;

        // Get the JSON webhook payload for the event that triggered the workflow

        if (pr.labels.every(l => l.name !== labelName)) {
            core.info("This PR does not have the label: " + labelName);
            return;
        }

        if (pr.labels.some(l => l.name === "Trello")) {
            core.info("This PR has the label: Trello");
            return;
        }


        const addCardResponse = await addCardToList(pr.title);

        checkStatus(addCardResponse);

        const cardData = await addCardResponse.json();

        const addAttachmentResponse = await addAttachmentToCard(cardData.id);

        checkStatus(addAttachmentResponse);

        const attachmentData = await addAttachmentResponse.json();

        await addLabelToPr(pr.number);


        //fetch('https://api.trello.com/1/cards?idList=' + trelloListId + '&key=' + trelloApiKey + '&token=' + trelloAuthToken, {
        //    method: 'POST',
        //    headers: {
        //        'Accept': 'application/json'
        //    }
        //})
        //    .then(response => {
        //        console.log(
        //            `Response: ${response.status} ${response.statusText}`
        //        );
        //        return response.text();
        //    })
        //    .then(text => console.log(text))
        //    .catch(err => console.error(err));


    } catch (error) {
        core.setFailed(error.message);
    }
}

async function addCardToList(cardName) {

    //https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-post
        // This code sample uses the 'node-fetch' library:
        // https://www.npmjs.com/package/node-fetch

    return await fetch('https://api.trello.com/1/cards?idList=' + trelloListId + '&key=' + trelloApiKey + '&token=' + trelloAuthToken + '&name=' + cardName, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }
    });
}

async function addAttachmentToCard(cardId,url) {

    //https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-post
        // This code sample uses the 'node-fetch' library:
        // https://www.npmjs.com/package/node-fetch

    return await fetch('https://api.trello.com/1/cards/' + cardId + '/attachments?key=' + trelloApiKey + '&token=' + trelloAuthToken + '&url=' + url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }
    });
}

function checkStatus(response) {
    if (response.ok) {
        // response.status >= 200 && response.status < 300
        return response;
    } else {
        throw new Error(`HTTP Error Response: ${response.status} ${response.statusText}`);
    }
}

async function addLabelToPr(issueNumber) {

    return await octokit.rest.issues.addLabels({
        owner: owner,
        repo: repo,
        issue_number: issueNumber,
        labels: ['Trello']
    });
}

run();