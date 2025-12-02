import { Book, MessageCircle, Mail, ExternalLink } from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    Button,
} from '@/components/ui';

export function HelpPage() {
    const faqs = [
        {
            question: 'What file formats are supported?',
            answer:
                'SumAI supports PDF, Word (.docx), Plain Text (.txt), and PowerPoint (.pptx) files up to 50MB in size.',
        },
        {
            question: 'How does semantic highlighting work?',
            answer:
                'When you hover over or click a summary sentence, the corresponding source text in the document is highlighted. This helps you quickly verify and understand the context of each summary point.',
        },
        {
            question: 'Can I adjust the summary length?',
            answer:
                'Yes! You can choose between Short (key points only), Balanced (comprehensive yet concise), or Detailed (in-depth analysis) summary lengths.',
        },
        {
            question: 'What export formats are available?',
            answer:
                'You can export your summarized documents as PDF, Word, or PowerPoint files. Each export includes both the summary and highlighted source sections.',
        },
        {
            question: 'Is my data secure?',
            answer:
                'Yes, all documents are encrypted in transit and at rest. We do not share your documents with third parties, and you can delete your data at any time from the Settings page.',
        },
    ];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-heading-1">Help Center</h1>
                <p className="text-muted mt-1">
                    Get answers to common questions and find support
                </p>
            </div>

            {/* Quick Links */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="flex flex-col items-center text-center py-6">
                        <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center mb-3">
                            <Book className="w-5 h-5 text-accent" />
                        </div>
                        <h3 className="font-medium text-foreground">Documentation</h3>
                        <p className="text-sm text-muted mt-1">Learn how to use SumAI</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="flex flex-col items-center text-center py-6">
                        <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center mb-3">
                            <MessageCircle className="w-5 h-5 text-accent" />
                        </div>
                        <h3 className="font-medium text-foreground">Live Chat</h3>
                        <p className="text-sm text-muted mt-1">Talk to our support team</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="flex flex-col items-center text-center py-6">
                        <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center mb-3">
                            <Mail className="w-5 h-5 text-accent" />
                        </div>
                        <h3 className="font-medium text-foreground">Email Support</h3>
                        <p className="text-sm text-muted mt-1">Get help via email</p>
                    </CardContent>
                </Card>
            </div>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>
                        Quick answers to common questions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="divide-y divide-border">
                        {faqs.map((faq, index) => (
                            <div key={index} className="py-4 first:pt-0 last:pb-0">
                                <h4 className="text-sm font-medium text-foreground mb-2">
                                    {faq.question}
                                </h4>
                                <p className="text-sm text-muted">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Contact Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Still need help?</CardTitle>
                    <CardDescription>
                        Our support team is here to assist you
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            leftIcon={<Mail className="w-4 h-4" />}
                        >
                            Contact Support
                        </Button>
                        <Button
                            variant="secondary"
                            className="flex-1"
                            leftIcon={<ExternalLink className="w-4 h-4" />}
                        >
                            View Tutorials
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
