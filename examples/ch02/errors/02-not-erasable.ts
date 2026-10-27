// syntax ที่ Node.js ลบทิ้งเฉย ๆ ไม่ได้ เพราะต้องสร้างโค้ด JavaScript เพิ่ม
enum Size {
  Small,
  Large,
}

class Customer {
  constructor(public name: string) {}
}

console.log(Size.Large, new Customer('Steve').name)
