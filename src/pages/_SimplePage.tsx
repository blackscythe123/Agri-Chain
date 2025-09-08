import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface SimplePageProps {
  title: string;
  description?: string;
}

const SimplePage = ({ title, description }: SimplePageProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-28">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
        {description && (
          <p className="text-muted-foreground max-w-2xl">{description}</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SimplePage;
