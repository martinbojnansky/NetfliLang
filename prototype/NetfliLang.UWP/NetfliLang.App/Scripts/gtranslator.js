var observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(addedNode => {
            try {
                if (addedNode.classList.contains('tlid-result')) {
                    const action = { value: document.querySelector('#source').value, translation: document.querySelector('.tlid-result .tlid-translation').textContent };
                    console.log(action);
                    NetfliLang.sendNotification('translated', JSON.stringify(action));
                }
            } catch (e) {
                //
            }
        }
        );
    });
});

observer.observe(document, {
    childList: true,
    subtree: true
});

function translate(value) {
    document.querySelector('#source').value = value;
}
