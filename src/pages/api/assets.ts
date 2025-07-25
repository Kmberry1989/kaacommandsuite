// Simple API route to serve asset data
import type { NextApiRequest, NextApiResponse } from 'next';

const assets = {
  images: [
    { name: "Spring Gala Banner", type: "Image", date: "2024-05-15", src: "https://placehold.co/600x400.png", dataAiHint: "art gallery event" },
    { name: "Artist Spotlight Headshot", type: "Image", date: "2024-05-12", src: "https://placehold.co/600x400.png", dataAiHint: "artist portrait" },
    { name: "Workshop Materials Photo", type: "Image", date: "2024-05-10", src: "https://placehold.co/600x400.png", dataAiHint: "art supplies" },
  ],
  documents: [
    { name: "Q2 Impact Report.pdf", type: "Document", date: "2024-06-01", icon: "FileText" },
    { name: "Grant Application Draft.docx", type: "Document", date: "2024-05-28", icon: "FileText" },
    { name: "Press Release - Spring Gala.docx", type: "Document", date: "2024-05-14", icon: "FileText" },
  ],
  visualizations: [
    { name: "Membership Growth Chart", type: "Chart", date: "2024-06-02", icon: "BarChart2" },
    { name: "Social Media Infographic", type: "Chart", date: "2024-05-20", icon: "BarChart2" },
  ],
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(assets);
}
