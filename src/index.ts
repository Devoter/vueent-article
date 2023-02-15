import { examples } from './examples';

const usageText = `Usage: node ${process.argv[1]} [EXAMPLE_NUMBER]
  -a, --available  print a list of available examples
  -h, --help       show this text
`;

const availExamples = `Available example:
  02: trivial models test
  04: storage interaction
  05: checking the operation of the validation rules
  06: complex model test
  08: collection base functions test
  09: collection's CRUD operations test
  10: Store class test
  11: StoreService class test

Enter "node index --help" to see the commands list
`;

async function main() {
  const command = process.argv[2];

  if (command === '-h' || command === '--help') {
    console.log(usageText);
    return;
  } else if (command === '-a' || command === '--available') {
    console.log(availExamples);
    return;
  }

  const exampleNumber = Number(process.argv[2]);

  const example = examples[exampleNumber as keyof typeof examples];

  if (example) {
    await example();
  } else {
    console.log('Error: Unexpected example number\n');
    console.log(availExamples);
  }
}

main();
