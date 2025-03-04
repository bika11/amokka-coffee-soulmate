
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { scrapeAmokkaProduct, scrapeMultipleProducts } from "@/lib/coffee-scraper";

export function ProductScraper() {
  const [url, setUrl] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Validate if the entered URL is a valid Amokka product URL
  const isValidAmokkaUrl = (testUrl: string): boolean => {
    try {
      const urlObj = new URL(testUrl);
      return urlObj.hostname === 'amokka.com' && 
            urlObj.pathname.includes('/products/');
    } catch {
      return false;
    }
  };

  // Handle scraping a single product
  const handleScrapeProduct = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    if (!isValidAmokkaUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Amokka product URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await scrapeAmokkaProduct(url);
      
      if (result) {
        toast({
          title: "Success!",
          description: `Product "${result.name}" has been scraped successfully`,
        });
        setUrl("");
      } else {
        toast({
          title: "Error",
          description: "Failed to scrape product",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error scraping product:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle scraping multiple products
  const handleBulkScrape = async () => {
    if (!bulkUrls.trim()) {
      toast({
        title: "Error",
        description: "Please enter URLs",
        variant: "destructive",
      });
      return;
    }

    // Parse URLs from textarea
    const urls = bulkUrls
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // Validate all URLs
    const invalidUrls = urls.filter(url => !isValidAmokkaUrl(url));
    if (invalidUrls.length > 0) {
      toast({
        title: "Invalid URLs",
        description: `Found ${invalidUrls.length} invalid URLs. Please make sure all URLs are valid Amokka product URLs.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await scrapeMultipleProducts(urls);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        setBulkUrls("");
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error scraping products:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-medium">Scrape Single Product</h2>
        <div className="flex gap-2">
          <Input
            placeholder="https://amokka.com/products/your-product"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          <Button 
            onClick={handleScrapeProduct} 
            disabled={loading || !url.trim()}
          >
            {loading ? "Scraping..." : "Scrape"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-medium">Bulk Scrape Products</h2>
        <p className="text-sm text-muted-foreground">
          Enter one product URL per line. This will process URLs in the background.
        </p>
        <Textarea
          placeholder="https://amokka.com/products/product-1
https://amokka.com/products/product-2
https://amokka.com/products/product-3"
          value={bulkUrls}
          onChange={(e) => setBulkUrls(e.target.value)}
          disabled={loading}
          rows={5}
        />
        <Button 
          onClick={handleBulkScrape} 
          className="w-full"
          disabled={loading || !bulkUrls.trim()}
        >
          {loading ? "Processing..." : "Bulk Scrape"}
        </Button>
      </div>
    </div>
  );
}
