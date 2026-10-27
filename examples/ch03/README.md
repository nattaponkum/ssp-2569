# บทที่ 3 การจัดการ Source Code ด้วย Git และ GitHub (Cheat Sheet)

บทนี้ไม่มีไฟล์ `.ts` ให้รัน เป็นบทฝึกใช้คำสั่ง Git ให้ทดลองในโฟลเดอร์ฝึกของตัวเอง
(เช่น `D:\projects\blog-demo`) **ห้ามสร้างไว้ในโฟลเดอร์ `ssp-2569`** เพราะจะเกิด repo ซ้อน repo

ค่า hash ของ commit, วันเวลา และ path ในเครื่องของท่านจะต่างจากในหนังสือเสมอ

## ตั้งค่าครั้งแรก (ทำครั้งเดียวต่อเครื่อง)

```bash
git --version
git config --global user.name "ชื่อ นามสกุล"
git config --global user.email อีเมลที่ใช้สมัคร@GitHub
git config --global init.defaultBranch main
git config --global core.autocrlf true      # Windows (macOS/Linux ใช้ input)
git config --global core.editor "code --wait"
git config --global --list
```

## สร้าง repository และบันทึกงาน

```bash
git init                      # สร้าง repo ในโฟลเดอร์ปัจจุบัน
git status                    # ดูสถานะ (ใช้บ่อยที่สุด)
git add .                     # หรือ git add <file>
git commit -m "Add /about route"
git log --oneline             # เติม --graph เพื่อดูเส้น branch
git log -1                    # รายละเอียด commit ล่าสุด
git diff                      # สิ่งที่แก้แต่ยังไม่ add
git diff --staged             # สิ่งที่ add แล้วแต่ยังไม่ commit
git restore <file>            # ทิ้งการแก้ไขที่ยังไม่ commit (หายถาวร)
git restore --staged <file>   # เอาออกจาก staging โดยไม่เสียการแก้ไข
git check-ignore -v .env      # ดูว่าไฟล์ถูก .gitignore บรรทัดไหนกันไว้
git rm --cached .env          # เลิก track ไฟล์ที่เผลอ commit ไปแล้ว (ไฟล์ในเครื่องยังอยู่)
```

## .gitignore สำหรับโปรเจกต์ TypeScript/Node.js

```gitignore
node_modules/
dist/
.env
.env.*
!.env.example
*.sqlite
uploads/
*.log
```

`package-lock.json` ต้อง commit เสมอ

## เชื่อมกับ GitHub

ยืนยันตัวตน (เลือกวิธีเดียว) GitHub ไม่รับรหัสผ่านบัญชีสำหรับ Git ผ่าน HTTPS แล้ว

- Git Credential Manager (มากับ Git for Windows): `git push` ครั้งแรก แล้วเลือก Sign in with your browser
- GitHub CLI: `gh auth login` เลือก GitHub.com, HTTPS, Yes, Login with a web browser
  แล้วนำ one-time code ที่ขึ้นใน Terminal ไปกรอกที่ https://github.com/login/device

```bash
# แบบที่ 1 เริ่มในเครื่องก่อน (สร้าง repo บน GitHub แบบว่าง ไม่เพิ่ม README)
git remote add origin https://github.com/<username>/<repo>.git
git remote -v
git branch -M main
git push -u origin main       # ครั้งต่อไปใช้แค่ git push

# แบบที่ 2 เริ่มบน GitHub ก่อน (สร้าง repo พร้อม README)
git clone https://github.com/<username>/<repo>.git
cd <repo>

# แก้ URL ของ origin
git remote set-url origin https://github.com/<username>/<repo>.git
```

## branch, merge และ Pull Request

```bash
git branch                    # รายชื่อ branch (* = ปัจจุบัน)
git switch -c feature/readme  # สร้าง branch ใหม่และสลับไป
git switch main               # สลับ branch
git merge feature/health      # รวม branch อื่นเข้า branch ปัจจุบัน
git branch -d feature/health  # ลบ branch ที่ merge แล้ว

# Pull Request
git push -u origin feature/readme
#   -> GitHub: Compare & pull request -> Create pull request -> Merge pull request -> Delete branch
git switch main
git pull
git branch -d feature/readme
```

## แก้ merge conflict

```bash
git merge feature/greeting    # CONFLICT (content): Merge conflict in src/index.ts
# เปิดไฟล์ แก้ส่วนระหว่าง <<<<<<< HEAD ... ======= ... >>>>>>> feature/greeting
# ให้เหลือโค้ดที่ถูกต้องชุดเดียว และลบ markers ทั้งหมด
git add src/index.ts
git status                    # All conflicts fixed but you are still merging.
git commit --no-edit
git merge --abort             # (ถ้าต้องการยกเลิกการ merge ทั้งหมด)
```

## ใช้ repo โค้ดตัวอย่างของหนังสือ

```bash
git clone https://github.com/nattaponkum/ssp-2569.git
cd ssp-2569
npm install

git tag                       # รายชื่อ tag เช่น ch04-end (ถ้าว่าง ลอง git fetch --tags)
git checkout ch04-end         # ดูโค้ด ณ ตอนจบบทที่ 4 (detached HEAD) แล้ว npm install อีกครั้ง
git switch --detach ch04-end  # ผลเหมือนบรรทัดบน
git switch -c try-ch04 ch04-end   # ถ้าอยากทดลองแก้โค้ดของบทนั้น
git switch main               # กลับมาที่โค้ดล่าสุด
git pull                      # รับโค้ดใหม่
```
