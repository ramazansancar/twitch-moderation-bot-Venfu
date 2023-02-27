setInterval(() => {
  fetch("http://localhost:3000/events", {
    headers: {
      Accept: "application/json",
    },
  })
    .then((resp) => resp.text())
    .then((data) => {
      data = JSON.parse(data);
      if (!data.type) return;
      document.getElementById("display").innerHTML = data.message;
    });
}, 1000);
