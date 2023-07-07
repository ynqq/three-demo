type C2 = {
  new (...args: any[]): any;
};
function single<T extends C2>(con: T) {
  return class A extends con {
    static instance: A;
    private constructor(...args: any[]) {
      if (A.instance) {
        return A.instance;
      }
      super(...args);
      A.instance = this;
    }
  };
}

function watch(getter, setter) {
  return function (target, key) {
    console.log(target, key);
    target[key] = 'asd';
  };
}

class Base {
  p(str: string) {
    console.log(str);
  }
  getCode() {
    return '';
  }
}

@single
class Demo extends Base {
  @watch(
    () => {
      console.log('getter');
    },
    () => {
      console.log('settter');
    }
  )
  str!: string;
  constructor(str: string) {
    super();
    // this.str = str;
  }
  log() {
    console.log(this.str);
  }
}

const demo = new Demo('2');
console.log(demo);
