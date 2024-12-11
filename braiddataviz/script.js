document.addEventListener('DOMContentLoaded', () => {
    const jsonFileInput = document.getElementById('jsonFile');
    const projectSelect = document.getElementById('projectSelect');
    const dateScroller = document.getElementById('dateScroller');

    const slackDataDiv = document.getElementById('slackData');
    const gitDataDiv = document.getElementById('gitData');
    const jiraDataDiv = document.getElementById('jiraData');
    const transcriptDataDiv = document.getElementById('transcriptData');

    let multiProjectData = null;

    jsonFileInput.addEventListener('change', handleFileUpload);
    projectSelect.addEventListener('change', handleProjectChange);
    dateScroller.addEventListener('change', handleDateChange);

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                multiProjectData = JSON.parse(content);
                populateProjects();
                alert('JSON file loaded successfully!');
            } catch (err) {
                console.error('Error parsing JSON:', err);
                alert('Failed to parse JSON file.');
            }
        };
        reader.readAsText(file);
    }

    function populateProjects() {
        projectSelect.innerHTML = '';
        if (!multiProjectData || !Array.isArray(multiProjectData)) {
            projectSelect.innerHTML = '<option value="">Invalid data structure</option>';
            projectSelect.disabled = true;
            return;
        }

        multiProjectData.forEach((project, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Project ${index + 1}`;
            projectSelect.appendChild(option);
        });
        projectSelect.disabled = false;
        // Trigger the first project selection
        projectSelect.selectedIndex = 0;
        handleProjectChange();
    }

    function handleProjectChange() {
        const projectIndex = projectSelect.value;
        if (projectIndex === '') return;

        const project = multiProjectData[projectIndex];
        if (!project || !Array.isArray(project.root)) {
            alert('Invalid ProjectData structure.');
            return;
        }

        const dates = project.root.map(pd => pd.date).filter(date => date).sort();
        if (dates.length === 0) {
            dateScroller.value = '';
            dateScroller.disabled = true;
            clearDataDisplays();
            return;
        }

        // Assuming date is in ISO format or can be converted to YYYY-MM-DD
        // Find the earliest and latest dates
        let parsedDates = dates.map(d => new Date(d));
        let minDate = new Date(Math.min(...parsedDates));
        let maxDate = new Date(Math.max(...parsedDates));

        // Set date scroller attributes
        dateScroller.min = formatDate(minDate);
        dateScroller.max = formatDate(maxDate);
        dateScroller.value = formatDate(maxDate); // Default to latest date
        dateScroller.disabled = false;

        // Render data for the selected date
        handleDateChange();
    }

    function handleDateChange() {
        const projectIndex = projectSelect.value;
        const selectedDate = dateScroller.value;
        if (projectIndex === '' || !selectedDate) return;

        const project = multiProjectData[projectIndex];
        const dateData = project.root.find(pd => formatDate(new Date(pd.date)) === selectedDate);

        if (!dateData) {
            clearDataDisplays();
            return;
        }

        displaySlackData(dateData.slack);
        displayGitData(dateData.git);
        displayJiraData(dateData.jira);
        displayTranscriptData(dateData.transcript);
    }

    function displaySlackData(slack) {
        slackDataDiv.innerHTML = '';
        if (!slack || !slack.slack_messages) {
            slackDataDiv.textContent = 'No Slack data available.';
            return;
        }

        slack.slack_messages.forEach(msg => {
            const div = document.createElement('div');
            div.className = 'data-item';
            div.innerHTML = `
                <h3>${msg.team_member_name || 'Unknown'} <span style="font-size:0.8em;color:#999;">(${msg.timestamp})</span></h3>
                <p>${msg.content || ''}</p>
            `;
            slackDataDiv.appendChild(div);
        });
    }

    function displayGitData(git) {
        gitDataDiv.innerHTML = '';
        if (!git || !git.root) {
            gitDataDiv.textContent = 'No Git data available.';
            return;
        }

        git.root.forEach(gitObj => {
            const div = document.createElement('div');
            div.className = 'data-item';
            div.innerHTML = `
                <h3>${gitObj.type} - ${gitObj.id}</h3>
                <p>Author: ${gitObj.author || 'Unknown'}</p>
                <p>Date: ${gitObj.date || 'N/A'}</p>
                <p>Message: ${formatGitMessage(gitObj.message)}</p>
            `;
            gitDataDiv.appendChild(div);
        });
    }

    function formatGitMessage(message) {
        if (!message) return '';
        if (typeof message === 'string') return message;
        if (typeof message === 'object') {
            return `<strong>${message.title || 'No Title'}</strong><br>${message.body || ''}`;
        }
        return '';
    }

    function displayJiraData(jira) {
        jiraDataDiv.innerHTML = '';
        if (!jira || !jira.tasks) {
            jiraDataDiv.textContent = 'No Jira data available.';
            return;
        }

        jira.tasks.forEach(task => {
            const div = document.createElement('div');
            div.className = 'data-item';
            div.innerHTML = `
                <h3>${task.title || 'No Title'} (${task.id})</h3>
                <p>Status: ${task.status || 'N/A'}</p>
                <p>Priority: ${task.priority || 'N/A'}</p>
                <p>Assignee: ${task.assignee || 'Unassigned'}</p>
                <p>Description: ${task.description || ''}</p>
            `;
            jiraDataDiv.appendChild(div);
        });
    }

    function displayTranscriptData(transcript) {
        transcriptDataDiv.innerHTML = '';
        if (!transcript || !transcript.speech_snippets) {
            transcriptDataDiv.textContent = 'No Transcript data available.';
            return;
        }

        transcript.speech_snippets.forEach(snippet => {
            const div = document.createElement('div');
            div.className = 'data-item';
            div.innerHTML = `
                <h3>${snippet.speaker_name || 'Unknown'} <span style="font-size:0.8em;color:#999;">(${snippet.timestamp})</span></h3>
                <p>${snippet.content || ''}</p>
            `;
            transcriptDataDiv.appendChild(div);
        });
    }

    function clearDataDisplays() {
        slackDataDiv.innerHTML = 'No data available.';
        gitDataDiv.innerHTML = 'No data available.';
        jiraDataDiv.innerHTML = 'No data available.';
        transcriptDataDiv.innerHTML = 'No data available.';
    }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = (`0${date.getMonth() + 1}`).slice(-2);
        const day = (`0${date.getDate()}`).slice(-2);
        return `${year}-${month}-${day}`;
    }
});