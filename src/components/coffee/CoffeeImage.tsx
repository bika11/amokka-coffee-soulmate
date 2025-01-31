interface CoffeeImageProps {
  imageUrl: string;
  name: string;
}

export const CoffeeImage = ({ imageUrl, name }: CoffeeImageProps) => {
  return (
    <div className="relative">
      <div className="w-full h-[300px] mb-8 overflow-hidden rounded-xl bg-white shadow-inner">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-contain bg-white transition-transform duration-300 hover:scale-105"
        />
      </div>
    </div>
  );
};