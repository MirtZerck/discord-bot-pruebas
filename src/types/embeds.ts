import { ImageURLOptions } from 'discord.js';

export interface CustomImageURLOptions extends ImageURLOptions {
    dynamic?: boolean;
}
