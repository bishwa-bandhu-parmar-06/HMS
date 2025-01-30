const form = document.querySelector('form'),
    nextbtn = form.querySelector('.nextbtn'),
    nextbtn2 = form.querySelector('.nextbtn2'),
    backbtn = form.querySelector('.backbtn'),
    allinput = form.querySelectorAll('.first input');

    nextbtn.onclick = (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
        
        let allFilled = true;
        allinput.forEach(input => {
            if (input.value === "") {
                allFilled = false;
                return; // Exit the loop early if any input is empty
            }
        });
        if (allFilled) {
            form.classList.add('secActive');
        } else {
            alert('Please fill all the fields');
        }
    };    

// nextbtn.onclick = () => {
//     form.classList.add('secActive');
// };


backbtn.onclick = () => {
    form.classList.remove('secActive');
};

