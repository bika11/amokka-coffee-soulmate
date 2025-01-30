interface CoffeeImageProps {
  imageUrl: string;
  name: string;
}

export const CoffeeImage = ({ imageUrl, name }: CoffeeImageProps) => {
  return (
    <div className="w-48 h-48 mx-auto mb-4 overflow-hidden rounded-lg">
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
      />
    </div>
  );
};