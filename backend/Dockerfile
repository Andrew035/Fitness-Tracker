# Start with a lightweight version of Python
FROM python:3.11-slim

# Tell Docker to do all following work inside a folder called /app in the container
WORKDIR /app

# Copy ONLY the requirements file first (this is a caching trick to make rebuilds faster)
COPY requirements.txt .

# Install all the Python libraries
RUN pip install --no-cache-dir -r requirements.txt

# Now, copy the rest of our backend code (like main.py) into the container
COPY . .

# Expose port 8000 so the outside world can talk to our API
EXPOSE 8000

# The command to start the server when the container turns on
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
