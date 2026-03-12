import { Queue, QueueOptions } from "bullmq";
import { getRedis } from "./redis";

/**
 * Returns a BullMQ Queue instance safely reusing the Redis connection.
 */
export function getQueue(queueName: string, options?: QueueOptions): Queue {
    const connection = getRedis();
    return new Queue(queueName, {
        connection,
        ...options,
    });
}
