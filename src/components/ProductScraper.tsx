import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProductScraper = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-amokka-product', {
        body: { url }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Product data has been scraped and stored successfully.",
      });

      setUrl('');
    } catch (error) {
      console.error('Error scraping product:', error);
      toast({
        title: "Error",
        description: "Failed to scrape product data. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center">Product Scraper</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium">
            Amokka Product URL
          </label>
          <Input
            id="url"
            type="url"
            placeholder="https://amokka.com/products/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            pattern="https://amokka\.com/products/.*"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Scraping..." : "Scrape Product"}
        </Button>
      </form>
    </div>
  );
};

export default ProductScraper;