import { Controller } from '@vueent/core';

import { registerController } from '@/vueent';
import ex02 from '@/examples/02';
import ex04 from '@/examples/04';
import ex05 from '@/examples/05';
import ex06 from '@/examples/06';
import ex08 from '@/examples/08';
import ex09 from '@/examples/09';
import ex10 from '@/examples/10';
import ex11 from '@/examples/11';

export default class AppController extends Controller {
  public readonly examples = [2, 4, 5, 6, 8, 9, 10, 11];

  public loadModule(num: number) {
    switch (num) {
      case 2:
        ex02();
        break;
      case 4:
        ex04();
        break;
      case 5:
        ex05();
        break;
      case 6:
        ex06();
        break;
      case 8:
        ex08();
        break;
      case 9:
        ex09();
        break;
      case 10:
        ex10();
        break;
      case 11:
        ex11();
        break;
    }
  }

  public clearConsole() {
    console.clear();
  }
}

registerController(AppController);
