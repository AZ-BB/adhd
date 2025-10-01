export default function Home() {
  const backgrounds = ["/bg2.jpg", "/bg3.jpg", "/bg4.jpg"]
  const selectedBg = backgrounds[Math.floor(Math.random() * backgrounds.length)]
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center"
      style={{ backgroundImage: `url(${selectedBg})` }}
    >
      <div className="absolute inset-0 bg-white/70"></div>
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to ADHD Support Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Thank you for completing the initial assessment. You can now access personalized resources and support for your child's ADHD journey.
        </p>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            What's Next?
          </h2>
          <div className="space-y-4 text-left">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-indigo-600 text-sm font-semibold">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Complete Your Profile</h3>
                <p className="text-gray-600">Add your child's information and preferences</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-indigo-600 text-sm font-semibold">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Access Resources</h3>
                <p className="text-gray-600">Browse personalized tools and strategies</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-indigo-600 text-sm font-semibold">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Track Progress</h3>
                <p className="text-gray-600">Monitor your child's development over time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
