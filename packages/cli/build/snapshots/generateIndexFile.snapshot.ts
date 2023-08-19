import { exampleHandlers } from './example';
import { testHandlers } from './test';
import { heyHandlers } from './hey';

export const handlers = [
    ...exampleHandlers,
    ...testHandlers,
    ...heyHandlers
];
