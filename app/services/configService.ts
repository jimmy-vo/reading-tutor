import dotenv from 'dotenv';
import { Grade } from '../models/backend/interface';

dotenv.config();

export namespace Env {
    export const storagePath = process.env.IMAGE_STORAGE!;
    export const defaultHistoryId = "will"
    export namespace Llm {
        export const azureOpenaiChatApiKey = process.env.AZURE_OPENAI_CHAT_API_KEY;
        export const azureOpenaiChatEndpoint = process.env.AZURE_OPENAI_CHAT_ENDPOINT;
        export const azureOpenaiChatDeployment = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
        export const enabled = azureOpenaiChatApiKey && azureOpenaiChatEndpoint && azureOpenaiChatDeployment;
        export const mockedApi: boolean | undefined = process.env.AZURE_OPENAI_CHAT_MOCKED_API ? process.env.AZURE_OPENAI_CHAT_MOCKED_API === 'true' : undefined;
    }
    export namespace Disfusion {
        export const azureOpenaiImageApiKey = process.env.AZURE_OPENAI_IMAGE_API_KEY;
        export const azureOpenaiImageEndpoint = process.env.AZURE_OPENAI_IMAGE_ENDPOINT;
        export const azureOpenaiImageDeployment = process.env.AZURE_OPENAI_IMAGE_DEPLOYMENT;
        export const enabled = azureOpenaiImageApiKey && azureOpenaiImageEndpoint && azureOpenaiImageDeployment;
        export const mockedApi: boolean | undefined = process.env.AZURE_OPENAI_IMAGE_MOCKED_API ? process.env.AZURE_OPENAI_IMAGE_MOCKED_API === 'true' : undefined;
    }
}
