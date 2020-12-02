import Person from './test';

const john = new Person('Park', 28);
console.log(john.getInfo());

const calculate = (a, b) => a + b;
console.log(calculate(2, 46));

const span = document.querySelector('span');
span.textContent = john.name;
