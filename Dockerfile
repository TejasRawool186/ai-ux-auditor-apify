# Use official Apify base image with Playwright and Chrome pre-installed
FROM apify/actor-node-playwright-chrome:20

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --omit=dev

# Copy all source files
COPY . ./

# Start the actor
CMD [ "npm", "start" ]
