import dotenv from 'dotenv';
import { Grade } from '../models/backend';

dotenv.config();

export const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY!;
export const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT!;
export const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT!;
export namespace Config {
    export const grades: Grade[] = [
        {
            id: 0,
            count: 3,
            questions: 2,
            topics: ["Home", "School", "Family"],
            passageFeatures: [
                "3 Simple sentences",
            ],
            questionFeatures: [
                "Literal recall",
                "Who/what/where",
                "Simple inference",
            ]
        },
        {
            id: 1,
            count: 4,
            questions: 1,
            topics: ["Home", "Animals", "School", "Family", "Weather", "Playtime"],
            passageFeatures: [
                "4 simple sentences",
                "Heavy illustration support"
            ],
            questionFeatures: [
                "Literal recall",
                "Who/what/where",
                "Simple inference",
                "Sequencing"
            ]
        },
        {
            id: 2,
            count: 5,
            questions: 5,
            topics: [
                "Community helpers",
                "Simple science",
                "Animals",
                "Weathers",
                "Basic stories"
            ],
            passageFeatures: [
                "80-150 words",
                "Short paragraphs",
                "Repetitive structure"
            ],
            questionFeatures: [
                "Literal comprehension",
                "Sequencing events",
                "Simple inference",
                "Find details",
                "Main idea"
            ]
        },
        {
            id: 3,
            count: 6,
            questions: 5,
            topics: ["Fables", "Culture", "Science concepts", "Friendship"],
            passageFeatures: [
                "100-200 words",
                "1-2 paragraphs",
                "Short narratives or factual"
            ],
            questionFeatures: [
                "Literal comprehension",
                "Basic inference",
                "Main idea/detail",
                "Cause/effect",
                "Vocabulary in context"
            ]
        },
        {
            id: 4,
            count: 5,
            questions: 5,
            topics: ["History", "Weather", "Character traits", "Fantasy"],
            passageFeatures: ["150-250 words", "2-3 paragraphs"],
            questionFeatures: [
                "Literal",
                "Inferential",
                "Author’s purpose",
                "Vocabulary",
                "Sequencing",
                "Comparing/contrasting"
            ]
        },
        {
            id: 5,
            count: 5,
            questions: 5,
            topics: [
                "Scientific ideas",
                "Historical events",
                "Adventure",
                "Biographies"
            ],
            passageFeatures: [
                "200-300 words",
                "More complex sentences and paragraphs"
            ],
            questionFeatures: [
                "Logical inference",
                "Summarizing",
                "Cause/effect",
                "Prediction",
                "Drawing conclusions",
                "Context clues"
            ]
        },
        // {
        //     id: 6,
        //     count: 5,
        //     questions: 5,
        //     topics: [
        //         "Nonfiction",
        //         "News",
        //         "Science",
        //         "Social issues",
        //         "Character perspectives"
        //     ],
        //     passageFeatures: [
        //         "250-400 words",
        //         "Multiple paragraphs",
        //         "May include dialogue"
        //     ],
        //     questionFeatures: [
        //         "Deeper inference",
        //         "Text evidence",
        //         "Theme",
        //         "Summarization",
        //         "Multi-step reasoning",
        //         "Compare/contrast"
        //     ]
        // },
        // {
        //     id: 7,
        //     count: 10,
        //     questions: 5,
        //     topics: [
        //         "Abstract topics",
        //         "History",
        //         "Science articles",
        //         "Literary genres"
        //     ],
        //     passageFeatures: [
        //         "300-500 words",
        //         "Subtle themes",
        //         "Multiple perspectives"
        //     ],
        //     questionFeatures: [
        //         "Author’s point of view",
        //         "Analysis",
        //         "Synthesizing",
        //         "Figurative language",
        //         "Complex inference",
        //         "Text support"
        //     ]
        // },
        // {
        //     id: 8,
        //     count: 10,
        //     questions: 5,
        //     topics: [
        //         "Persuasive texts",
        //         "Science articles",
        //         "Current events",
        //         "Fiction excerpts"
        //     ],
        //     passageFeatures: ["400-600 words", "Complex structure", "Sub-plots"],
        //     questionFeatures: [
        //         "Author’s craft",
        //         "Argument/evidence",
        //         "Summarizing",
        //         "Drawing conclusions",
        //         "Analyzing tone",
        //         "Connecting info"
        //     ]
        // },
        // {
        //     id: 9,
        //     count: 10,
        //     questions: 5,
        //     topics: [
        //         "Literary analysis",
        //         "Persuasive essays",
        //         "Historical documents",
        //         "Contemporary issues"
        //     ],
        //     passageFeatures: [
        //         "500-800 words",
        //         "Thematic/layered techniques",
        //         "Longer and denser"
        //     ],
        //     questionFeatures: [
        //         "Literary devices",
        //         "Synthesis",
        //         "Argument analysis",
        //         "Multiple viewpoints",
        //         "Evaluating credibility",
        //         "Supporting with quotations"
        //     ]
        // }
    ]
} 