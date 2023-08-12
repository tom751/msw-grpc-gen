import { handlers as exampleHandlers } from './example';
import { handlers as testHandlers } from './test';
import { handlers as heyHandlers } from './hey';

export const handlers = [
    ...exampleHandlers,
    ...testHandlers,
    ...heyHandlers
];
