# syntax=docker/dockerfile:1
# Dockerfile แบบ multi-stage: stage แรกสร้างหน้าเว็บ stage สุดท้ายมีแค่สิ่งที่ต้องใช้ตอนรันจริง

# ---------- stage 1: build client (Vue) ----------
FROM node:24-slim AS build
WORKDIR /app

# คัดลอกเฉพาะ package.json ก่อน เพื่อให้ Docker cache ขั้น npm ci ไว้ได้ ถ้า dependency ไม่เปลี่ยน
COPY package.json package-lock.json .npmrc ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/
COPY examples/package.json examples/
RUN npm ci

COPY shared shared
COPY client client
RUN npm run build -w @ssp/client

# ---------- stage 2: runtime (Node.js 24 รันไฟล์ .ts ได้โดยตรง) ----------
FROM node:24-slim
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/
COPY examples/package.json examples/
# ติดตั้งเฉพาะ dependency ที่ server ใช้งานจริง (ไม่เอา devDependencies เช่น vitest, drizzle-kit)
RUN npm ci --omit=dev -w @ssp/server -w @ssp/shared && npm cache clean --force

COPY shared/src shared/src
COPY server/src server/src
COPY server/drizzle server/drizzle
COPY --from=build /app/client/dist client/dist

# ไม่รันด้วย root: เตรียมโฟลเดอร์ข้อมูลให้ผู้ใช้ node (มีอยู่แล้วใน image) เป็นเจ้าของ
RUN mkdir -p server/data server/uploads && chown -R node:node server/data server/uploads
USER node

WORKDIR /app/server
EXPOSE 8081
# อัปเดตโครงสร้างฐานข้อมูล (migration) ก่อน แล้วจึงเริ่ม server
# exec ให้ node แทนที่ sh เป็น process หลัก (PID 1) จึงได้รับสัญญาณ SIGTERM จาก docker stop โดยตรง
CMD ["sh", "-c", "node src/db/migrate.ts && exec node src/index.ts"]
