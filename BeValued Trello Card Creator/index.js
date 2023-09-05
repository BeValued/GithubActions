const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');
const htmlMarkdown = require('node-html-markdown');

const trelloApiKey = core.getInput('trello-api-key', { required: true });
const trelloAuthToken = core.getInput('trello-auth-token', { required: true });
const trelloListId = core.getInput('trello-list-id', { required: true });
const trelloBoardId = core.getInput('trello-board-id', { required: true });
const trelloLabels = core.getInput('trello-labels')?.split(',');

const githubToken = core.getInput('github-token', { required: true });
const owner = core.getInput('owner', { required: true });
const repo = core.getInput('repo', { required: true });

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

        core.info("Checking Label");

        if (pr.labels.every(l => l.name !== labelName)) {
            core.info("This PR does not have the label: " + labelName);
            return;
        }

        if (pr.labels.some(l => l.name === "Trello")) {
            core.info("This PR has the label: Trello");
            return;
        }

        core.info("Has label and is not on trello - continuing");


        const labelIds = [];

        if (trelloLabels !== null ?? trelloLabels.length > 0) {
            labelIds = await getTrelloLabelIds(trelloLabels);
            core.info('labelIds: ' + labelIds);
        }

        const addCardResponse = await addCardToList(pr.title, pr.body, labelIds);

        checkStatus(addCardResponse);


        const cardData = await addCardResponse.json();

        const addAttachmentResponse = await addAttachmentToCard(cardData.id, pr.html_url);

        checkStatus(addAttachmentResponse);

        const attachmentData = await addAttachmentResponse.json();

        await addLabelToPr(pr.number);

    } catch (error) {
        core.setFailed(error.message);
    }
}

async function getTrelloLabelIds(trelloLabels) {

    core.info('Finding label ids:' + trelloLabels.toString());

    const boardLabelData = await fetch('https://api.trello.com/1/boards/' + trelloBoardId + '/labels?key=' + trelloApiKey + '&token=' + trelloAuthToken, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });

    checkStatus(boardLabelData);

    core.info(JSON.stringify(boardLabelData.json()));

    return boardLabelData.json().filter(b => trelloLabels.includes(b.name)).map(b => b.id);

}

async function addCardToList(cardName, description, labelIds) {

    //https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-post
    // This code sample uses the 'node-fetch' library:
    // https://www.npmjs.com/package/node-fetch

    core.info("Adding card to Trello: " + cardName);

    core.info(description);

    core.info(labelIds);

    var markdown = htmlMarkdown.NodeHtmlMarkdown.translate(description);

    core.info(markdown);

    return await fetch('https://api.trello.com/1/cards?idList=' + trelloListId + '&key=' + trelloApiKey + '&token=' + trelloAuthToken + '&name=' + encodeURIComponent(cardName) + '&desc=' + encodeURIComponent(markdown) + '&idLabels=' + labelIds.toString(), {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }
    });
}

async function addAttachmentToCard(cardId, url) {

    core.info('Adding attachment ' + url + ' to card: ' + cardId);


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
        core.info('response OK');
        return response;
    } else {
        throw new Error(`HTTP Error Response: ${response.status} ${response.statusText}`);
    }
}

async function addLabelToPr(issueNumber) {

    core.info('Adding label to PR' + issueNumber);


    return await octokit.rest.issues.addLabels({
        owner: owner,
        repo: repo,
        issue_number: issueNumber,
        labels: ['Trello']
    });
}

run();