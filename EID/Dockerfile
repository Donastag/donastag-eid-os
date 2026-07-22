FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --no-frozen-lockfile --ignore-scripts
ENV NEXT_PUBLIC_API_URL=http://192.168.3.211:8002
COPY . .
RUN pnpm build

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://192.168.3.211:8002

CMD ["pnpm", "start"]
