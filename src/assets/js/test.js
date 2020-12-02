class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  getInfo() {
    return `${this.name} is ${this.age} year old!`;
  }
}
export default Person;
