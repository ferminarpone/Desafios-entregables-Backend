const form = document.getElementById('registerForm');

form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const obj = {}
    data.forEach((value, key) => obj[key] = value)

    // Usamos Fetch
    fetch('/api/sessions/register', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(result => {
        if (result.status === 200) {
            window.location.replace('/users/login')
        }else{
            Swal.fire({
                icon: "error",
                text: `Debes completar todos los campos requeridos`,
                width: 400,
              });
        }
    })
})


