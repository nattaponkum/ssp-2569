const prices = [65, 55, 70, 45, 80]
const tags = ['node', 'typescript', 'hono']

// map: แปลงสมาชิกทุกตัว ได้ตัวแปรชุดใหม่ที่ยาวเท่าเดิม
const labels = prices.map((p) => `${p} บาท`)
console.log('map     :', labels)

// filter: เลือกเฉพาะตัวที่เงื่อนไขเป็นจริง
const cheap = prices.filter((p) => p < 60)
console.log('filter  :', cheap)

// find: คืนตัวแรกที่ตรงเงื่อนไข ถ้าไม่เจอได้ undefined
console.log('find    :', prices.find((p) => p > 66), prices.find((p) => p > 100))

// some / every: มีบางตัว / ทุกตัว ตรงเงื่อนไขหรือไม่
console.log('some    :', prices.some((p) => p > 75), 'every:', prices.every((p) => p > 0))

// includes / indexOf: มีค่านี้อยู่หรือไม่ / อยู่ตำแหน่งใด
console.log('includes:', tags.includes('hono'), 'indexOf:', tags.indexOf('typescript'))

// reduce: ยุบทั้งชุดให้เหลือค่าเดียว เช่น ผลรวม
const total = prices.reduce((sum, p) => sum + p, 0)
console.log('reduce  :', total, 'เฉลี่ย', total / prices.length)

// spread (...) คัดลอกหรือรวมตัวแปรชุด
const copy = [...prices]
copy.push(100)
console.log('copy    :', copy)
console.log('prices  :', prices)
console.log('merged  :', [...tags, 'vue'])

// sort แก้ไขของเดิม ส่วน toSorted คืนชุดใหม่
const sorted = prices.toSorted((a, b) => a - b)
console.log('sorted  :', sorted, 'prices เดิม:', prices)
