# Mini YouTube

Mini YouTube is a scalable video processing platform that leverages Apache Kafka, Docker, MinIO, PostgreSQL, and Nginx. It allows users to upload videos, processes them asynchronously, and stores them in different formats using an efficient microservices architecture.

## Introduction

Mini YouTube provides a streamlined approach to handling video uploads, processing, and storage. By utilizing Apache Kafka for message queuing, Docker for containerization, and Nginx for load balancing, the application efficiently encodes videos into multiple formats and manages storage using MinIO. PostgreSQL is used to store metadata and track video processing states.

## Features

- Scalable server architecture with load balancing
- Video uploads with multipart form-data
- Asynchronous video encoding into multiple formats
- Efficient storage management with MinIO object store
- Kafka integration for message-driven processing
- PostgreSQL integration for managing metadata and processing states

## Architecture

### Overview

1. **Upload Service**: Handles video uploads and stores the raw video files in a MinIO buffer.
2. **Kafka Integration**: When a video is uploaded, a message containing the video's metadata is sent to a Kafka topic.
3. **Encoding Service**: Kafka consumers pick up the messages, retrieve the corresponding videos from the MinIO buffer, encode them into multiple formats, and store the encoded versions in another MinIO object store. The original video is then deleted from the buffer.
4. **Scalable Server Setup**: The application runs on two server containers, with Nginx used as a reverse proxy to load balance requests between them, ensuring high availability and scalability.
5. **PostgreSQL Database**: Stores metadata related to the videos, including processing states, and helps track the lifecycle of each video.

## Why Apache Kafka?

Kafka is used to ensure that video processing is done asynchronously and efficiently. Rather than directly passing large video files through the system, Kafka enables the use of lightweight metadata messages to signal when a video needs processing. This approach offers several benefits:

- **Decoupling of Services**: By using Kafka, the upload and encoding services are decoupled. This means that video uploads can continue even if the encoding service is temporarily unavailable, as the metadata will remain in the Kafka queue.
- **Scalability**: Kafka allows the application to handle high volumes of video uploads by efficiently distributing processing tasks across multiple consumers.
- **Reliability**: Kafka’s message persistence ensures that no video processing task is lost, even if there is a system failure.

## Why MinIO Object Store?

MinIO is used as the object store in this project for several reasons:

- **Efficient Storage**: MinIO allows us to store large video files efficiently, offering high availability and reliability. It's designed to handle unstructured data such as videos and images at scale.
- **Separation of Concerns**: By storing videos in an object store, the application can keep the handling of video files separate from the main application logic and databases. This separation simplifies the overall architecture.
- **Cost-Effectiveness**: MinIO is a cost-effective solution for storing large amounts of data, making it ideal for use cases like video storage where the volume of data can be significant.
- **Compatibility**: MinIO is S3-compatible, making it easy to integrate with other services and tools in the cloud ecosystem.

## Use Case Diagram

The following diagram illustrates the primary use cases of the Mini YouTube platform, including video uploads, processing, and storage.

You can view the Use Case Diagram [here](https://lucid.app/lucidchart/bb3c3d61-175d-4d95-8dea-e2fb94c4fc17/edit?viewport_loc=-313%2C-991%2C3345%2C1570%2C0_0&invitationId=inv_c5b19f9c-2a5c-480f-b527-dbc253f6d74e)

## Containers Network Diagram

This diagram depicts the network configuration between the containers, showing how Nginx, the main server, Kafka, MinIO, and PostgreSQL interact.

You can view the Containers Network  Diagram [here](https://lucid.app/lucidspark/b0036f47-d417-4d98-b52f-5a2cca7138ee/edit?viewport_loc=-4922%2C-3529%2C12682%2C6135%2C0_0&invitationId=inv_2e061d1a-44e7-4ccd-9439-0e21baab269b)

## System Design Diagram

Here is an overview of the system design, detailing the flow of data from video upload to processing and final storage.

You can view the System Design Diagram [here](https://lucid.app/lucidchart/38c52863-b917-4ce8-a2ca-9bde05773a7e/edit?invitationId=inv_fa8d6106-b7b1-4a32-87f9-e5ca650347f3)
## Database Schema

![image](https://github.com/user-attachments/assets/05f21b05-01f4-4734-9f66-93cdbb1dc26b)

