items = {};
frontIndex = 0;
backIndex = 0;

module.exports = {
  enqueue: (item) => {
    items[backIndex] = item;
    backIndex++;
    return item + " inserted";
  },
  dequeue: () => {
    const item = items[frontIndex];
    if (item) {
        delete items[frontIndex];
        frontIndex++;
    }
    return item || {};
  },
  peek: () => {
    return items[frontIndex];
  },
  printQueue: () => {
    return items;
  },
};
