document.getElementById('send-btn').addEventListener('click', () => {
    const url = document.getElementById('url').value;
    const jsonInput = document.getElementById('json-input').value;

    let diagnosticsOutput = '';

    try {
        const parsedJson = JSON.parse(jsonInput);

        diagnosticsOutput += 'JSON parsed successfully.\n';

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(parsedJson),
        })
        .then(response => {
            diagnosticsOutput += `Status: ${response.status} ${response.statusText}\n`;
            diagnosticsOutput += `Headers: ${JSON.stringify([...response.headers])}\n`;

            return response.json().then(data => {
                document.getElementById('response-output').textContent = JSON.stringify(data, null, 2);
            });
        })
        .catch(error => {
            diagnosticsOutput += `Error: ${error.message}\n`;
        })
        .finally(() => {
            document.getElementById('diagnostics-output').textContent = diagnosticsOutput;
        });

    } catch (error) {
        diagnosticsOutput += `Invalid JSON: ${error.message}\n`;
        document.getElementById('diagnostics-output').textContent = diagnosticsOutput;
    }
});

