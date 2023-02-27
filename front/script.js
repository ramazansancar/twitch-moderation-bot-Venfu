var displayEvent = () => {
  fetch("http://localhost:3000/events", {
    headers: {
      Accept: "application/json",
    },
  })
    .then((resp) => resp.text())
    .then((data) => {
      data = JSON.parse(data);
      if (!data.type) {
        delay = 500;
        setTimeout(displayEvent, delay);
        return;
      }
      document.getElementById("display").innerHTML = data.message;
      delay = 10000;
      setTimeout(displayEvent, delay);
    });
};
setTimeout(displayEvent, 0);
