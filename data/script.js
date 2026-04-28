document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('myButton');

    if (button) {
        button.addEventListener('click', () => {
            alert('Button clicked! This page is bug-free (for now).');
        });
    } else {
        console.error('Button with ID "myButton" not found.');
    }
});